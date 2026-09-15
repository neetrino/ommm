import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import {
  buildTokenAndWhere,
  containsInsensitive,
  userContainsToken,
} from '../common/token-text-search';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminCoachActiveFilter,
  AdminCoachOrder,
  type AdminListCoachesQueryDto,
} from './dto/admin-list-coaches-query.dto';
import { calculateAgeFromDateOfBirth } from './coaches-profile.helpers';
import type { CoachAdminListRow } from './coaches.types';

@Injectable()
export class CoachesAdminListService {
  constructor(private readonly prisma: PrismaService) {}

  async listAdmin(query: AdminListCoachesQueryDto = {}) {
    const hasPagination =
      query.take !== undefined || query.offset !== undefined;
    const specialization = query.specialization?.trim();
    const classTypes = (query.classType ?? [])
      .map((entry) => entry.trim())
      .filter(Boolean);
    const searchWhere = buildTokenAndWhere(
      query.q,
      (token): Prisma.CoachProfileWhereInput => ({
        OR: [
          { user: userContainsToken(token) },
          { id: containsInsensitive(token) },
          { userId: containsInsensitive(token) },
          { specialization: containsInsensitive(token) },
          { classType: containsInsensitive(token) },
        ],
      }),
    );
    const activeFilters = (query.isActive ?? []).filter(
      (entry) => entry !== AdminCoachActiveFilter.ALL,
    );
    const activeClauses: Prisma.CoachProfileWhereInput[] = [];
    if (activeFilters.includes(AdminCoachActiveFilter.ACTIVE)) {
      activeClauses.push({ isActive: true });
    }
    if (activeFilters.includes(AdminCoachActiveFilter.INACTIVE)) {
      activeClauses.push({ isActive: false });
    }
    const classTypeClauses: Prisma.CoachProfileWhereInput[] = classTypes.map(
      (classType) => ({
        classType: {
          equals: classType,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
    );
    const and: Prisma.CoachProfileWhereInput[] = [];
    if (searchWhere) {
      and.push(searchWhere);
    }
    if (specialization) {
      and.push({
        specialization: {
          contains: specialization,
          mode: Prisma.QueryMode.insensitive,
        },
      });
    }
    if (classTypeClauses.length === 1) {
      and.push(classTypeClauses[0]!);
    } else if (classTypeClauses.length > 1) {
      and.push({ OR: classTypeClauses });
    }
    if (activeClauses.length === 1) {
      and.push(activeClauses[0]!);
    } else if (activeClauses.length > 1) {
      and.push({ OR: activeClauses });
    }
    const where: Prisma.CoachProfileWhereInput =
      and.length > 0 ? { AND: and } : {};
    const listAdminArgs = {
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            dateOfBirth: true,
            avatarUrl: true,
          },
        },
        ...({
          availabilitySlots: {
            orderBy: [{ slotDate: 'asc' }, { slotTime: 'asc' }],
          },
          classTypeRates: {
            select: {
              classTypeId: true,
              amountAmd: true,
            },
            orderBy: { classTypeId: 'asc' },
          },
          _count: {
            select: {
              sessions: true,
              substituteSessions: true,
            },
          },
        } as Record<string, unknown>),
      },
      orderBy: {
        createdAt: query.order === AdminCoachOrder.OLDEST ? 'asc' : 'desc',
      },
    } as Prisma.CoachProfileFindManyArgs;
    const mapRows = (rows: CoachAdminListRow[]) =>
      rows.map((row) => ({
        id: row.id,
        bio: row.bio,
        specialization: row.specialization,
        classType: row.classType,
        assignedClassTypeIds: row.assignedClassTypeIds,
        experienceYears: row.experienceYears,
        salaryPerClassAmd: row.salaryPerClassAmd ?? 0,
        cardImageUrl: row.cardImageUrl,
        classTypeRates: (row.classTypeRates ?? []).map((rate) => ({
          classTypeId: rate.classTypeId,
          amountAmd: rate.amountAmd,
        })),
        isActive: row.isActive,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        userId: row.userId,
        totalClasses: row._count.sessions,
        substituteClasses: row._count.substituteSessions,
        schedule: row.availabilitySlots.map((slot) => ({
          id: slot.id,
          date: slot.slotDate.toISOString(),
          time: slot.slotTime,
          spots: slot.availableSpots,
        })),
        user: {
          id: row.user.id,
          name: row.user.name,
          lastName: row.user.lastName,
          email: row.user.email,
          phone: row.user.phone,
          role: row.user.role,
          dateOfBirth: row.user.dateOfBirth?.toISOString() ?? null,
          avatarUrl: row.user.avatarUrl,
        },
        age: calculateAgeFromDateOfBirth(row.user.dateOfBirth),
      }));

    if (!hasPagination) {
      return this.prisma.coachProfile
        .findMany(listAdminArgs)
        .then((rows) => mapRows(rows as unknown as CoachAdminListRow[]));
    }

    const take = query.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = query.offset ?? 0;
    const [rows, total] = await Promise.all([
      this.prisma.coachProfile.findMany({
        ...listAdminArgs,
        take,
        skip: offset,
      }),
      this.prisma.coachProfile.count({ where }),
    ]);
    return {
      items: mapRows(rows as unknown as CoachAdminListRow[]),
      total,
      take,
      offset,
    };
  }
}
