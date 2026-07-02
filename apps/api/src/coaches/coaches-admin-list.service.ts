import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
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
    const q = query.q?.trim();
    const specialization = query.specialization?.trim();
    const classType = query.classType?.trim();
    const where: Prisma.CoachProfileWhereInput = {
      ...(q
        ? {
            OR: [
              {
                user: {
                  email: { contains: q, mode: Prisma.QueryMode.insensitive },
                },
              },
              {
                user: {
                  name: { contains: q, mode: Prisma.QueryMode.insensitive },
                },
              },
              {
                user: {
                  lastName: { contains: q, mode: Prisma.QueryMode.insensitive },
                },
              },
              {
                user: {
                  phone: { contains: q, mode: Prisma.QueryMode.insensitive },
                },
              },
              {
                id: { contains: q, mode: Prisma.QueryMode.insensitive },
              },
              {
                userId: { contains: q, mode: Prisma.QueryMode.insensitive },
              },
              {
                specialization: {
                  contains: q,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                classType: { contains: q, mode: Prisma.QueryMode.insensitive },
              },
            ],
          }
        : {}),
      ...(specialization
        ? {
            specialization: {
              contains: specialization,
              mode: Prisma.QueryMode.insensitive,
            },
          }
        : {}),
      ...(classType
        ? {
            classType: {
              contains: classType,
              mode: Prisma.QueryMode.insensitive,
            },
          }
        : {}),
      ...(query.isActive === AdminCoachActiveFilter.ACTIVE
        ? { isActive: true }
        : {}),
      ...(query.isActive === AdminCoachActiveFilter.INACTIVE
        ? { isActive: false }
        : {}),
    };
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
