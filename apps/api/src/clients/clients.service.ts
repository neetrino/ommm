import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  MembershipStatus,
  PaymentStatus,
  Prisma,
  Role,
} from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminClientQuickFilter,
  AdminClientStatusFilter,
  AdminClientTagFilter,
  AdminClientMembershipFilter,
  AdminClientOrder,
  type AdminListClientsQueryDto,
} from './dto/admin-list-clients-query.dto';
import type { UpdateClientDto } from './dto/update-client.dto';

const NEW_CLIENT_DAYS = 30;
const INACTIVE_CLIENT_DAYS = 30;

const clientInclude = Prisma.validator<Prisma.UserInclude>()({
  memberships: {
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  },
  bookings: {
    include: {
      session: {
        include: {
          classType: true,
          coach: {
            include: {
              user: { select: { id: true, name: true, lastName: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  },
  payments: { orderBy: { createdAt: 'desc' }, take: 50 },
  giftCardsPurchased: { orderBy: { createdAt: 'desc' }, take: 20 },
  giftCardsReceived: { orderBy: { createdAt: 'desc' }, take: 20 },
  clientNotesReceived: {
    orderBy: { createdAt: 'desc' },
    take: 1,
    include: { author: { select: { id: true, name: true, email: true } } },
  },
  _count: { select: { clientNotesReceived: true } },
});

type ClientRecord = Prisma.UserGetPayload<{ include: typeof clientInclude }>;
type ClientTag = 'VIP' | 'New' | 'At Risk' | 'Beginner';
type ClientStatus = 'Active' | 'Inactive' | 'Frozen';
type PaymentBehavior = 'paid' | 'unpaid' | 'overdue' | 'partial';
type AttendanceBehavior =
  | 'regular'
  | 'no-show'
  | 'often-cancels'
  | 'low-attendance';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(query: AdminListClientsQueryDto) {
    const q = (query.search ?? query.q)?.trim();
    const where: Prisma.UserWhereInput = {
      role: Role.USER,
      ...(q
        ? {
            OR: [
              { id: { contains: q, mode: Prisma.QueryMode.insensitive } },
              { email: { contains: q, mode: Prisma.QueryMode.insensitive } },
              { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
              { lastName: { contains: q, mode: Prisma.QueryMode.insensitive } },
              { phone: { contains: q, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {}),
      ...(query.membership === AdminClientMembershipFilter.ACTIVE
        ? {
            memberships: {
              some: {
                status: MembershipStatus.ACTIVE,
                currentPeriodEnd: { gt: new Date() },
              },
            },
          }
        : {}),
      ...(query.membership === AdminClientMembershipFilter.INACTIVE
        ? {
            memberships: {
              none: {
                status: MembershipStatus.ACTIVE,
                currentPeriodEnd: { gt: new Date() },
              },
            },
          }
        : {}),
    };
    const users = await this.prisma.user.findMany({
      where,
      include: clientInclude,
      orderBy: {
        createdAt: query.order === AdminClientOrder.OLDEST ? 'asc' : 'desc',
      },
      take: 500,
    });
    const rows = this.sortRows(
      users.map((user) => this.toClientRow(user)),
      query.order ?? AdminClientOrder.NEWEST,
    ).filter((row) => this.matchesClientFilters(row, query));

    if (!query.meta) {
      return rows.slice(0, query.take ?? 500);
    }

    const offset = query.offset ?? 0;
    const take = query.take ?? 100;
    return {
      rows: rows.slice(offset, offset + take),
      summary: this.toSummary(rows),
      filterOptions: this.toFilterOptions(rows),
      pagination: { total: rows.length, take, offset },
    };
  }

  async get(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, role: Role.USER },
      include: clientInclude,
    });
    if (!user) {
      throw new NotFoundException();
    }
    const notes = await this.listNotes(id);
    const { passwordHash, ...rest } = user;
    void passwordHash;
    return {
      ...rest,
      activity: this.toClientRow(user),
      notes,
    };
  }

  async updateBasicInfo(id: string, dto: UpdateClientDto) {
    const user = await this.prisma.user.findFirst({
      where: { id, role: Role.USER },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException();
    }
    const data = {
      ...(dto.email !== undefined && { email: dto.email.toLowerCase() }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.dateOfBirth !== undefined && {
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
      }),
    };
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No updatable fields were provided');
    }
    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        phone: true,
      },
    });
    await this.audit.log({
      action: 'CLIENT_UPDATED',
      entityType: 'User',
      entityId: id,
      payload: data,
    });
    return updated;
  }

  async listNotes(userId: string) {
    await this.assertUserExists(userId);
    return this.prisma.clientNote.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      take: 200,
    });
  }

  async addNote(
    authorId: string,
    authorRole: Role,
    userId: string,
    body: string,
  ) {
    await this.assertUserExists(userId);
    const note = await this.prisma.clientNote.create({
      data: {
        userId,
        authorId,
        body: body.trim(),
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
    await this.audit.log({
      actorId: authorId,
      actorRole: authorRole,
      action: 'CLIENT_NOTE_ADDED',
      entityType: 'ClientNote',
      entityId: note.id,
      payload: { userId },
    });
    return note;
  }

  private async assertUserExists(id: string) {
    const exists = await this.prisma.user.findFirst({
      where: { id, role: Role.USER },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException();
    }
  }

  private toClientRow(user: ClientRecord) {
    const activeMembership = this.getActiveMembership(user);
    const latestBooking = this.getLatestVisit(user);
    const totals = this.getBookingTotals(user);
    const lifetimeValueCents = user.payments
      .filter((payment) => payment.status === PaymentStatus.SUCCEEDED)
      .reduce((sum, payment) => sum + payment.amountCents, 0);
    const paymentBehavior = this.getPaymentBehavior(user);
    const attendanceBehavior = this.getAttendanceBehavior(totals);
    const classLevels = this.getClassLevels(user);
    const tags = this.getTags({ user, paymentBehavior, classLevels });
    const preferredCoach = this.getPreferredCoach(user);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      status: this.getClientStatus(user),
      source: this.getSource(user),
      preferredCoach,
      memberships: user.memberships,
      activeMembership,
      packageType: this.getPackageType(activeMembership),
      paymentBehavior,
      attendanceBehavior,
      classLevels,
      tags,
      noteCount: user._count.clientNotesReceived,
      latestNote: user.clientNotesReceived[0] ?? null,
      totalVisits: totals.attended,
      totalBookings: totals.total,
      totalCancellations: totals.cancelled,
      totalNoShows: totals.noShows,
      lifetimeValueCents,
      lastVisitDate: latestBooking?.session.startsAt ?? null,
      birthdayMonth: user.dateOfBirth ? user.dateOfBirth.getMonth() + 1 : null,
    };
  }

  private getActiveMembership(user: ClientRecord) {
    const now = new Date();
    return (
      user.memberships.find(
        (membership) =>
          membership.status === MembershipStatus.ACTIVE &&
          membership.currentPeriodEnd > now,
      ) ?? null
    );
  }

  private getLatestVisit(user: ClientRecord) {
    return (
      user.bookings
        .filter((booking) => booking.status === BookingStatus.COMPLETED)
        .sort(
          (a, b) => b.session.startsAt.getTime() - a.session.startsAt.getTime(),
        )[0] ?? null
    );
  }

  private getBookingTotals(user: ClientRecord) {
    return {
      total: user.bookings.length,
      attended: user.bookings.filter(
        (booking) => booking.status === BookingStatus.COMPLETED,
      ).length,
      cancelled: user.bookings.filter(
        (booking) => booking.status === BookingStatus.CANCELLED,
      ).length,
      noShows: user.bookings.filter(
        (booking) => booking.status === BookingStatus.MISSED,
      ).length,
    };
  }

  private getClientStatus(user: ClientRecord): ClientStatus {
    if (
      user.memberships.some(
        (membership) => membership.status === MembershipStatus.PAUSED,
      )
    ) {
      return 'Frozen';
    }
    return this.getActiveMembership(user) ? 'Active' : 'Inactive';
  }

  private getSource(
    user: ClientRecord,
  ): 'website' | 'mobile-app' | 'admin' | null {
    const firstBooking = [...user.bookings].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    )[0];
    if (!firstBooking) {
      return user.memberships.length > 0 ? 'admin' : null;
    }
    return firstBooking.channel === 'APP' ? 'mobile-app' : 'website';
  }

  private getPackageType(
    membership: ClientRecord['memberships'][number] | null,
  ): 'single-class' | 'monthly-package' | 'vip-package' | null {
    if (!membership) {
      return 'single-class';
    }
    const marker =
      `${membership.plan.name} ${membership.plan.slug}`.toLowerCase();
    if (marker.includes('vip')) {
      return 'vip-package';
    }
    return 'monthly-package';
  }

  private getPaymentBehavior(user: ClientRecord): PaymentBehavior {
    if (
      user.payments.some((payment) => payment.status === PaymentStatus.FAILED)
    ) {
      return 'overdue';
    }
    if (
      user.payments.some((payment) => payment.status === PaymentStatus.PENDING)
    ) {
      return 'unpaid';
    }
    return user.payments.some(
      (payment) => payment.status === PaymentStatus.SUCCEEDED,
    )
      ? 'paid'
      : 'unpaid';
  }

  private getAttendanceBehavior(params: {
    total: number;
    attended: number;
    cancelled: number;
    noShows: number;
  }): AttendanceBehavior {
    if (params.noShows > 0) {
      return 'no-show';
    }
    if (params.total >= 3 && params.cancelled / params.total >= 0.35) {
      return 'often-cancels';
    }
    if (params.total >= 3 && params.attended / params.total < 0.5) {
      return 'low-attendance';
    }
    return 'regular';
  }

  private getClassLevels(user: ClientRecord) {
    return Array.from(
      new Set(
        user.bookings
          .map(
            (booking) =>
              booking.session.level ?? booking.session.classType.name,
          )
          .filter((value): value is string => Boolean(value)),
      ),
    );
  }

  private getTags(params: {
    user: ClientRecord;
    paymentBehavior: PaymentBehavior;
    classLevels: string[];
  }): ClientTag[] {
    const tags: ClientTag[] = [];
    const createdMs = params.user.createdAt.getTime();
    const isNew =
      Date.now() - createdMs <= NEW_CLIENT_DAYS * 24 * 60 * 60 * 1000;
    const hasVip = params.user.memberships.some((membership) =>
      `${membership.plan.name} ${membership.plan.slug}`
        .toLowerCase()
        .includes('vip'),
    );
    if (hasVip) tags.push('VIP');
    if (isNew) tags.push('New');
    if (
      params.paymentBehavior === 'overdue' ||
      params.paymentBehavior === 'unpaid'
    ) {
      tags.push('At Risk');
    }
    if (
      params.classLevels.some((level) =>
        level.toLowerCase().includes('beginner'),
      )
    ) {
      tags.push('Beginner');
    }
    return tags;
  }

  private getPreferredCoach(user: ClientRecord) {
    const counts = new Map<
      string,
      { id: string; name: string; count: number }
    >();
    for (const booking of user.bookings) {
      const coach = booking.session.coach;
      const name = [coach.user.name, coach.user.lastName]
        .filter(Boolean)
        .join(' ');
      const current = counts.get(coach.id);
      counts.set(coach.id, {
        id: coach.id,
        name: name || '—',
        count: (current?.count ?? 0) + 1,
      });
    }
    return [...counts.values()].sort((a, b) => b.count - a.count)[0] ?? null;
  }

  private matchesClientFilters(
    row: ReturnType<ClientsService['toClientRow']>,
    query: AdminListClientsQueryDto,
  ) {
    if (query.tag && !this.matchesTag(row.tags, query.tag)) return false;
    if (query.status && !this.matchesStatus(row.status, query.status))
      return false;
    if (query.packageType && row.packageType !== query.packageType)
      return false;
    if (
      query.classLevel &&
      !this.matchesClassLevel(row.classLevels, query.classLevel)
    )
      return false;
    if (
      query.paymentStatus &&
      row.paymentBehavior !== String(query.paymentStatus)
    )
      return false;
    if (query.source && row.source !== query.source) return false;
    if (
      query.preferredCoachId &&
      row.preferredCoach?.id !== query.preferredCoachId
    )
      return false;
    if (query.attendance && row.attendanceBehavior !== String(query.attendance))
      return false;
    if (query.birthdayMonth && row.birthdayMonth !== query.birthdayMonth)
      return false;
    if (query.quick && !this.matchesQuickFilter(row, query.quick)) return false;
    return true;
  }

  private matchesTag(tags: ClientTag[], tag: AdminClientTagFilter) {
    const label =
      tag === AdminClientTagFilter.AT_RISK
        ? 'At Risk'
        : tag === AdminClientTagFilter.NEW
          ? 'New'
          : tag === AdminClientTagFilter.VIP
            ? 'VIP'
            : 'Beginner';
    return tags.includes(label);
  }

  private matchesStatus(status: ClientStatus, filter: AdminClientStatusFilter) {
    if (filter === AdminClientStatusFilter.BLOCKED) return false;
    if (filter === AdminClientStatusFilter.FROZEN) return status === 'Frozen';
    if (filter === AdminClientStatusFilter.ACTIVE) return status === 'Active';
    return status === 'Inactive';
  }

  private matchesClassLevel(levels: string[], filter: string) {
    return levels.some((level) =>
      level.toLowerCase().includes(filter.toLowerCase()),
    );
  }

  private matchesQuickFilter(
    row: ReturnType<ClientsService['toClientRow']>,
    filter: AdminClientQuickFilter,
  ) {
    if (filter === AdminClientQuickFilter.BIRTHDAY_THIS_MONTH) {
      return row.birthdayMonth === new Date().getMonth() + 1;
    }
    if (filter === AdminClientQuickFilter.INACTIVE_30_DAYS) {
      if (row.lastVisitDate === null) return row.status === 'Inactive';
      return (
        Date.now() - row.lastVisitDate.getTime() >
        INACTIVE_CLIENT_DAYS * 86400000
      );
    }
    if (filter === AdminClientQuickFilter.UNPAID)
      return row.paymentBehavior === 'unpaid';
    if (filter === AdminClientQuickFilter.NO_SHOW)
      return row.attendanceBehavior === 'no-show';
    if (filter === AdminClientQuickFilter.AT_RISK)
      return row.tags.includes('At Risk');
    if (filter === AdminClientQuickFilter.VIP) return row.tags.includes('VIP');
    return row.tags.includes('New');
  }

  private sortRows(
    rows: Array<ReturnType<ClientsService['toClientRow']>>,
    order: AdminClientOrder,
  ) {
    return [...rows].sort((a, b) => {
      if (order === AdminClientOrder.OLDEST)
        return a.createdAt.getTime() - b.createdAt.getTime();
      if (order === AdminClientOrder.MOST_ACTIVE)
        return b.totalVisits - a.totalVisits;
      if (order === AdminClientOrder.HIGHEST_LIFETIME_VALUE)
        return b.lifetimeValueCents - a.lifetimeValueCents;
      if (order === AdminClientOrder.LAST_VISIT_NEWEST)
        return (
          this.dateValue(b.lastVisitDate) - this.dateValue(a.lastVisitDate)
        );
      if (order === AdminClientOrder.LAST_VISIT_OLDEST)
        return (
          this.dateValue(a.lastVisitDate) - this.dateValue(b.lastVisitDate)
        );
      if (order === AdminClientOrder.MOST_BOOKINGS)
        return b.totalBookings - a.totalBookings;
      if (order === AdminClientOrder.MOST_CANCELLATIONS)
        return b.totalCancellations - a.totalCancellations;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  private dateValue(value: Date | null) {
    return value?.getTime() ?? 0;
  }

  private toSummary(rows: Array<ReturnType<ClientsService['toClientRow']>>) {
    return {
      total: rows.length,
      active: rows.filter((row) => row.status === 'Active').length,
      vip: rows.filter((row) => row.tags.includes('VIP')).length,
      atRisk: rows.filter((row) => row.tags.includes('At Risk')).length,
      totalVisits: rows.reduce((sum, row) => sum + row.totalVisits, 0),
      lifetimeValueCents: rows.reduce(
        (sum, row) => sum + row.lifetimeValueCents,
        0,
      ),
    };
  }

  private toFilterOptions(
    rows: Array<ReturnType<ClientsService['toClientRow']>>,
  ) {
    const coaches = new Map<string, string>();
    for (const row of rows) {
      if (row.preferredCoach)
        coaches.set(row.preferredCoach.id, row.preferredCoach.name);
    }
    return {
      preferredCoaches: [...coaches.entries()].map(([id, name]) => ({
        id,
        name,
      })),
      classLevels: Array.from(
        new Set(rows.flatMap((row) => row.classLevels)),
      ).sort(),
    };
  }
}
