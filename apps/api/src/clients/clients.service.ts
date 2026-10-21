import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminClientOrder,
  type AdminListClientsQueryDto,
} from './dto/admin-list-clients-query.dto';
import { ClientsAdminCreateService } from './clients-admin-create.service';
import { ClientsAdminService } from './clients-admin.service';
import { CLIENTS_POST_PROCESS_SCAN_LIMIT } from './clients-list.constants';
import {
  buildClientsListWhere,
  requiresClientsPostProcessing,
  resolveClientsListOrderBy,
  scopeClientsListWhere,
} from './clients-list-query.builder';
import {
  computeClientsFilterOptionsFromDb,
  computeClientsSummaryFromDb,
  filterOptionsFromRows,
  summaryFromRows,
} from './clients-list-summary';
import { matchesClientFilters, sortClientRows } from './clients-row-filters';
import { clientInclude, toClientRow } from './clients-row.mapper';
import {
  attachNextBookingsToRows,
  loadNextBookingsByUserId,
} from './clients-row-next-booking';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminCreate: ClientsAdminCreateService,
    private readonly admin: ClientsAdminService,
  ) {}

  create(
    actor: Parameters<ClientsAdminCreateService['create']>[0],
    dto: Parameters<ClientsAdminCreateService['create']>[1],
  ) {
    return this.adminCreate.create(actor, dto);
  }

  updateBasicInfo(
    actor: Parameters<ClientsAdminService['updateBasicInfo']>[0],
    id: string,
    dto: Parameters<ClientsAdminService['updateBasicInfo']>[2],
  ) {
    return this.admin.updateBasicInfo(actor, id, dto);
  }

  remove(actor: Parameters<ClientsAdminService['remove']>[0], id: string) {
    return this.admin.remove(actor, id);
  }

  restore(actor: Parameters<ClientsAdminService['restore']>[0], id: string) {
    return this.admin.restore(actor, id);
  }

  addNote(authorId: string, authorRole: Role, userId: string, body: string) {
    return this.admin.addNote(authorId, authorRole, userId, body);
  }

  async list(query: AdminListClientsQueryDto, coachId?: string) {
    const built = buildClientsListWhere(query);
    const where = coachId ? scopeClientsListWhere(built, coachId) : built;
    const take = query.take ?? (query.meta ? 100 : 500);
    const offset = query.offset ?? 0;

    if (requiresClientsPostProcessing(query)) {
      return this.listWithPostProcessing(query, where, take, offset);
    }

    if (!query.meta) {
      const users = await this.prisma.user.findMany({
        where,
        include: clientInclude,
        orderBy: resolveClientsListOrderBy(query),
        take,
      });
      const rows = users.map((user) => toClientRow(user));
      return this.withAccurateNextBookings(rows);
    }

    const [total, users, summary, filterOptions] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        include: clientInclude,
        orderBy: resolveClientsListOrderBy(query),
        skip: offset,
        take,
      }),
      computeClientsSummaryFromDb(this.prisma, where),
      computeClientsFilterOptionsFromDb(
        this.prisma,
        where,
        clientInclude,
        (user) => toClientRow(user),
      ),
    ]);

    const rows = await this.withAccurateNextBookings(
      users.map((user) => toClientRow(user)),
    );

    return {
      rows,
      summary,
      filterOptions,
      pagination: { total, take, offset },
    };
  }

  private async listWithPostProcessing(
    query: AdminListClientsQueryDto,
    where: Prisma.UserWhereInput,
    take: number,
    offset: number,
  ) {
    const order = query.order ?? AdminClientOrder.NEWEST;
    const users = await this.prisma.user.findMany({
      where,
      include: clientInclude,
      orderBy: { createdAt: 'desc' },
      take: CLIENTS_POST_PROCESS_SCAN_LIMIT,
    });
    const filtered = sortClientRows(
      users
        .map((user) => toClientRow(user))
        .filter((row) => matchesClientFilters(row, query)),
      order,
    );

    if (!query.meta) {
      return this.withAccurateNextBookings(filtered.slice(0, take));
    }

    const pageRows = filtered.slice(offset, offset + take);
    return {
      rows: await this.withAccurateNextBookings(pageRows),
      summary: summaryFromRows(filtered),
      filterOptions: filterOptionsFromRows(filtered),
      pagination: { total: filtered.length, take, offset },
    };
  }

  private async withAccurateNextBookings<
    T extends {
      id: string;
      nextBooking: ReturnType<typeof toClientRow>['nextBooking'];
    },
  >(rows: T[]): Promise<T[]> {
    const nextByUserId = await loadNextBookingsByUserId(
      this.prisma,
      rows.map((row) => row.id),
    );
    return attachNextBookingsToRows(rows, nextByUserId);
  }

  /** Admin-shaped client directory for the signed-in coach's own students. */
  async listForCoachUser(userId: string, query: AdminListClientsQueryDto) {
    const coachId = await this.requireCoachProfileId(userId);
    return this.list(query, coachId);
  }

  /** One client row, only when they have booked this coach. */
  async getForCoachUser(userId: string, clientId: string) {
    const coachId = await this.requireCoachProfileId(userId);
    const user = await this.prisma.user.findFirst({
      where: {
        id: clientId,
        role: Role.USER,
        bookings: { some: { session: { coachId } } },
      },
      include: clientInclude,
    });
    if (!user) {
      throw new NotFoundException();
    }
    const [activity] = await this.withAccurateNextBookings([toClientRow(user)]);
    return { activity };
  }

  private async requireCoachProfileId(userId: string): Promise<string> {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw new NotFoundException();
    }
    return profile.id;
  }

  async get(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, role: Role.USER },
      include: clientInclude,
    });
    if (!user) {
      throw new NotFoundException();
    }
    const notes = await this.admin.listNotes(id);
    const [activity] = await this.withAccurateNextBookings([toClientRow(user)]);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      phone: user.phone,
      whatsappPhone: user.whatsappPhone,
      dateOfBirth: user.dateOfBirth,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      activity,
      notes,
    };
  }
}
