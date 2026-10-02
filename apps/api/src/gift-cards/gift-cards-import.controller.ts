import {
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { BACKOFFICE_WRITE_ROLES } from '../common/backoffice-roles';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { GIFT_CARD_IMPORT_MAX_BYTES } from './gift-card-excel';
import { buildGiftImportTemplate, GIFT_XLSX_CONTENT_TYPE } from './gift-card-excel-file';
import { GiftCardsService } from './gift-cards.service';

@Controller('gift-cards')
export class GiftCardsImportController {
  constructor(private readonly giftCards: GiftCardsService) {}

  @Get('admin/import/template')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  async template(@Res() res: Response) {
    sendXlsx(res, 'gift-cards-import.xlsx', await buildGiftImportTemplate());
  }

  @Post('admin/import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: GIFT_CARD_IMPORT_MAX_BYTES } }))
  importExcel(
    @CurrentUser() user: { id: string },
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    return this.giftCards.importGiftExcel(user.id, file);
  }
}

function sendXlsx(res: Response, filename: string, body: Buffer): void {
  res.setHeader('Content-Type', GIFT_XLSX_CONTENT_TYPE);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(body);
}
