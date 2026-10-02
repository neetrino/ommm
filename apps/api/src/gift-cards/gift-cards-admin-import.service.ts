import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminCreateGiftCardDto } from './dto/admin-create-gift-card.dto';
import {
  GIFT_CARD_IMPORT_MAX_BYTES,
  type GiftImportIssue,
  type GiftImportIssueCode,
  type GiftImportRow,
} from './gift-card-excel';
import { readGiftImportMatrix } from './gift-card-excel-file';
import { parseGiftImportMatrix } from './gift-card-excel-rows';
import { GiftCardsAdminBatchWriteService } from './gift-cards-admin-batch-write.service';

type ClassTypeName = { id: string; name: string };

export type GiftImportResult = {
  createdBatches: number;
  createdCards: number;
  issues: GiftImportIssue[];
};

type UploadFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class GiftCardsAdminImportService {
  private readonly logger = new Logger(GiftCardsAdminImportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly batchWrite: GiftCardsAdminBatchWriteService,
  ) {}

  async importWorkbook(
    adminId: string,
    file: UploadFile | undefined,
  ): Promise<GiftImportResult> {
    const buffer = assertXlsxUpload(file);
    const matrix = await this.readMatrix(buffer);
    const parsed = parseGiftImportMatrix(matrix);
    if (parsed.rows.length === 0) {
      return { createdBatches: 0, createdCards: 0, issues: parsed.issues };
    }
    const classTypes = await this.prisma.classType.findMany({
      where: { archivedAt: null },
      select: { id: true, name: true },
    });
    return this.createRows(adminId, parsed.rows, parsed.issues, classTypes);
  }

  private async createRows(
    adminId: string,
    rows: readonly GiftImportRow[],
    issues: GiftImportIssue[],
    classTypes: readonly ClassTypeName[],
  ): Promise<GiftImportResult> {
    let createdBatches = 0;
    let createdCards = 0;
    const nextIssues = [...issues];
    for (const row of rows) {
      const outcome = await this.importRow(adminId, row, classTypes);
      if (outcome === 'ok') {
        createdBatches += 1;
        createdCards += row.quantity;
        continue;
      }
      nextIssues.push({ rowNumber: row.rowNumber, code: outcome });
    }
    return { createdBatches, createdCards, issues: nextIssues };
  }

  private async importRow(
    adminId: string,
    row: GiftImportRow,
    classTypes: readonly ClassTypeName[],
  ): Promise<'ok' | GiftImportIssueCode> {
    const dto = buildCreateDto(row);
    const classIssue = applyClass(dto, row, classTypes);
    if (classIssue !== null) {
      return classIssue;
    }
    const recipientIssue = await this.applyRecipient(dto, row.recipientEmail);
    if (recipientIssue !== null) {
      return recipientIssue;
    }
    try {
      await this.batchWrite.createAdminCard(adminId, dto);
      return 'ok';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'create failed';
      this.logger.warn(`Gift import row ${row.rowNumber} failed: ${message}`);
      return 'create_failed';
    }
  }

  private async readMatrix(buffer: Buffer) {
    try {
      return await readGiftImportMatrix(buffer);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'unreadable workbook';
      this.logger.warn(`Gift import workbook could not be read: ${message}`);
      throw new BadRequestException('gift_import_unreadable');
    }
  }

  private async applyRecipient(
    dto: AdminCreateGiftCardDto,
    email: string | null,
  ): Promise<GiftImportIssueCode | null> {
    if (email === null) {
      return null;
    }
    const user = await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, role: 'USER' },
      select: { id: true },
    });
    if (user === null) {
      return 'recipient_not_found';
    }
    dto.recipientId = user.id;
    return null;
  }
}

function buildCreateDto(row: GiftImportRow): AdminCreateGiftCardDto {
  const dto = new AdminCreateGiftCardDto();
  dto.quantity = row.quantity;
  dto.type = row.kind === 'class' ? 'FIXED_CLASS' : 'FIXED_VALUE';
  dto.amountAmd = row.amountAmd ?? undefined;
  dto.classQuantity = row.sessions ?? undefined;
  dto.message = row.message ?? undefined;
  dto.expiresAt = row.expiresAt ?? undefined;
  return dto;
}

function applyClass(
  dto: AdminCreateGiftCardDto,
  row: GiftImportRow,
  classTypes: readonly ClassTypeName[],
): GiftImportIssueCode | null {
  if (row.kind !== 'class') {
    return null;
  }
  const matched = matchClassType(row.className ?? '', classTypes);
  if (matched === 'missing') {
    return 'class_not_found';
  }
  if (matched === 'ambiguous') {
    return 'ambiguous_class';
  }
  dto.classTypeId = matched.id;
  return null;
}

function matchClassType(
  name: string,
  classTypes: readonly ClassTypeName[],
): ClassTypeName | 'missing' | 'ambiguous' {
  const needle = name.trim().toLowerCase();
  const matches = classTypes.filter(
    (row) => row.name.trim().toLowerCase() === needle,
  );
  if (matches.length === 1) {
    return matches[0] ?? 'missing';
  }
  return matches.length === 0 ? 'missing' : 'ambiguous';
}

function assertXlsxUpload(file: UploadFile | undefined): Buffer {
  if (file === undefined || file.buffer.length === 0) {
    throw new BadRequestException('gift_import_required');
  }
  const name = file.originalname.toLowerCase();
  const csv = name.endsWith('.csv') || file.mimetype.includes('csv');
  if (file.size > GIFT_CARD_IMPORT_MAX_BYTES) {
    throw new BadRequestException('gift_import_too_large');
  }
  if (csv || !name.endsWith('.xlsx')) {
    throw new BadRequestException('gift_import_not_xlsx');
  }
  return file.buffer;
}
