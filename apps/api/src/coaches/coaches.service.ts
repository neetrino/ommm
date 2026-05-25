import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { Prisma } from '@prisma/client';
import { BookingStatus, Role, WaitlistStatus, type User } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { hashPassword } from '../common/password-crypto';
import { PrismaService } from '../prisma/prisma.service';
import { R2HomeImageStorage } from '../storage/r2-home-image.storage';
import { absolutePathForStoredUpload } from '../users/user-upload.helpers';
import type { CreateCoachDto } from './dto/create-coach.dto';
import {
  COACH_AVAILABILITY_MAX_SPOTS,
  COACH_AVAILABILITY_MIN_SPOTS,
  type CoachScheduleSlotDto,
} from './dto/coach-schedule-slot.dto';
import type { UploadCoachPhotoJsonDto } from './dto/upload-coach-photo-json.dto';
import type { UpdateCoachDto } from './dto/update-coach.dto';

type CoachAvailabilitySlotRow = {
  id: string;
  slotDate: Date;
  slotTime: string;
  availableSpots: number;
};

type CoachAdminListRow = {
  id: string;
  userId: string;
  bio: string | null;
  specialization: string | null;
  classType: string | null;
  assignedClassTypeIds: string[];
  experienceYears: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  availabilitySlots: CoachAvailabilitySlotRow[];
  user: {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    role: Role;
    dateOfBirth: Date | null;
    avatarUrl: string | null;
  };
};

type CoachUpdateResult = {
  id: string;
  bio: string | null;
  specialization: string | null;
  classType: string | null;
  experienceYears: number | null;
  assignedClassTypeIds: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  availabilitySlots: CoachAvailabilitySlotRow[];
  user: {
    id: string;
    name: string | null;
    email: string;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
  };
};

@Injectable()
export class CoachesService {
  private static readonly COACH_PHOTO_MAX_BYTES = 10 * 1024 * 1024;
  private static readonly COACH_PHOTO_MIME_EXT: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly r2Storage: R2HomeImageStorage,
  ) {}

  listPublic() {
    return this.prisma.coachProfile.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: { id: true, name: true, lastName: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  getPublic(id: string) {
    return this.prisma.coachProfile.findFirst({
      where: { id, isActive: true },
      include: {
        user: { select: { id: true, name: true, lastName: true, avatarUrl: true } },
      },
    });
  }

  async create(dto: CreateCoachDto) {
    const email = dto.email.toLowerCase().trim();
    const phone = dto.phone.trim();
    const specialization = dto.specialization.trim();
    const classType = dto.classType.trim();
    const assignedClassTypeIds = this.normalizeAssignedClassTypeIds(
      dto.assignedClassTypeIds,
    );
    const availabilitySlots = this.normalizeSchedule(dto.schedule);
    const normalizedPhotoUrl = this.normalizePhotoUrl(dto.photoUrl);
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      throw new BadRequestException('Invalid phone number');
    }
    if (specialization.length === 0) {
      throw new BadRequestException('Specialization is required');
    }
    await this.assertValidCoachClassType(classType);
    await this.assertValidAssignedClassTypeIds(assignedClassTypeIds);

    const [emailTaken, phoneTaken] = await Promise.all([
      this.prisma.user.findUnique({ where: { email } }),
      this.prisma.user.findUnique({ where: { phone } }),
    ]);
    if (emailTaken) {
      throw new ConflictException('An account with this email already exists.');
    }
    if (phoneTaken) {
      throw new ConflictException(
        'An account with this phone number already exists.',
      );
    }

    const passwordHash = await hashPassword(dto.password);
    const dateOfBirth = this.resolveDateOfBirthFromInputs(
      dto.age,
      dto.birthday,
    );

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: dto.name.trim(),
          lastName: dto.lastName.trim(),
          phone,
          dateOfBirth,
          avatarUrl: normalizedPhotoUrl,
          role: Role.COACH,
          emailVerified: new Date(),
        },
      });
      const coachCreateData = {
        userId: user.id,
        bio: dto.bio,
        specialization,
        classType,
        experienceYears: dto.experienceYears,
        ...(availabilitySlots.length > 0 && {
          availabilitySlots: {
            createMany: {
              data: availabilitySlots,
            },
          },
        }),
        ...(assignedClassTypeIds.length > 0 && { assignedClassTypeIds }),
      } as unknown as Prisma.CoachProfileUncheckedCreateInput;
      const coachCreateSelect = {
        id: true,
        classType: true,
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        ...({
          assignedClassTypeIds: true,
          availabilitySlots: {
            select: {
              id: true,
              slotDate: true,
              slotTime: true,
              availableSpots: true,
            },
            orderBy: [{ slotDate: 'asc' }, { slotTime: 'asc' }],
          },
        } as Record<string, unknown>),
      } as Prisma.CoachProfileSelect;
      return tx.coachProfile.create({
        data: coachCreateData,
        select: coachCreateSelect,
      });
    });
  }

  async uploadCoachPhotoJson(
    coachProfileId: string,
    dto: UploadCoachPhotoJsonDto,
  ): Promise<{ avatarUrl: string }> {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { id: coachProfileId },
      include: { user: { select: { id: true, avatarUrl: true } } },
    });
    if (!profile) {
      throw new NotFoundException('Coach profile not found');
    }
    const mimeType = dto.mimeType.trim().toLowerCase();
    const ext = CoachesService.COACH_PHOTO_MIME_EXT[mimeType];
    if (!ext) {
      throw new BadRequestException('Unsupported image type');
    }
    const rawBase64 = dto.imageBase64.trim().replace(/\s/g, '');
    const payloadStart = rawBase64.indexOf('base64,');
    const normalizedBase64 =
      rawBase64.startsWith('data:') && payloadStart >= 0
        ? rawBase64.slice(payloadStart + 'base64,'.length)
        : rawBase64;
    const buffer = Buffer.from(normalizedBase64, 'base64');
    if (buffer.length === 0) {
      throw new BadRequestException('Image data is empty');
    }
    if (buffer.length > CoachesService.COACH_PHOTO_MAX_BYTES) {
      throw new BadRequestException('Photo is too large (max 10 MB)');
    }
    if (!this.r2Storage.isConfigured()) {
      throw new ServiceUnavailableException(
        `Coach photo upload requires R2. Incomplete env: ${this.r2Storage.listMissingR2Env().join(', ')}`,
      );
    }

    const filename = `${randomUUID()}.${ext}`;
    const avatarUrl = await this.r2Storage.putObject({
      key: `coach-avatar/${profile.user.id}/${filename}`,
      body: buffer,
      contentType: mimeType,
    });

    await this.prisma.user.update({
      where: { id: profile.user.id },
      data: { avatarUrl },
    });
    await this.removeOldCoachPhoto(profile.user.avatarUrl, avatarUrl);
    return { avatarUrl };
  }

  private approximateDateOfBirthFromAge(ageYears: number): Date {
    const d = new Date();
    d.setFullYear(d.getFullYear() - ageYears);
    return d;
  }

  private parseBirthdayToDateOnly(value: string): Date {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('Birthday must be a valid date');
    }
    return new Date(
      Date.UTC(
        parsed.getUTCFullYear(),
        parsed.getUTCMonth(),
        parsed.getUTCDate(),
      ),
    );
  }

  private resolveDateOfBirthFromInputs(age: number, birthday: string): Date {
    const fromBirthday = this.parseBirthdayToDateOnly(birthday);
    const computedAge = this.calculateAgeFromDateOfBirth(fromBirthday);
    if (computedAge !== null && Math.abs(computedAge - age) > 1) {
      throw new BadRequestException('Age does not match birthday');
    }
    return fromBirthday;
  }

  private resolveDateOfBirthForUpdate(
    age: number | undefined,
    birthday: string | undefined,
    hasAge: boolean,
    hasBirthday: boolean,
  ): Date | undefined {
    if (hasBirthday) {
      const date = this.parseBirthdayToDateOnly(birthday ?? '');
      if (hasAge && age !== undefined) {
        const computedAge = this.calculateAgeFromDateOfBirth(date);
        if (computedAge !== null && Math.abs(computedAge - age) > 1) {
          throw new BadRequestException('Age does not match birthday');
        }
      }
      return date;
    }
    if (hasAge && age !== undefined) {
      return this.approximateDateOfBirthFromAge(age);
    }
    return undefined;
  }

  async update(actor: User, coachProfileId: string, dto: UpdateCoachDto) {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { id: coachProfileId },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!profile) {
      throw new NotFoundException();
    }
    if (actor.role === Role.COACH && profile.userId !== actor.id) {
      throw new ForbiddenException();
    }
    if (actor.role === Role.MANAGER && dto.isActive === false) {
      throw new ForbiddenException('Managers cannot deactivate coaches');
    }
    const normalizedPhone =
      dto.phone === undefined ? undefined : this.normalizePhone(dto.phone);
    const normalizedSpecialization =
      dto.specialization === undefined ? undefined : dto.specialization.trim();
    const normalizedClassType =
      dto.classType === undefined ? undefined : dto.classType.trim();
    const normalizedPhotoUrl =
      dto.photoUrl === undefined
        ? undefined
        : this.normalizePhotoUrl(dto.photoUrl);
    const normalizedAssignedClassTypeIds =
      dto.assignedClassTypeIds === undefined
        ? undefined
        : this.normalizeAssignedClassTypeIds(dto.assignedClassTypeIds);
    const normalizedSchedule =
      dto.schedule === undefined
        ? undefined
        : this.normalizeSchedule(dto.schedule);
    if (
      normalizedSpecialization !== undefined &&
      normalizedSpecialization.length === 0
    ) {
      throw new BadRequestException('Specialization is required');
    }
    if (normalizedClassType !== undefined && normalizedClassType.length === 0) {
      throw new BadRequestException('Class type is required');
    }
    if (normalizedClassType !== undefined) {
      await this.assertValidCoachClassType(normalizedClassType);
    }
    if (normalizedAssignedClassTypeIds !== undefined) {
      await this.assertValidAssignedClassTypeIds(
        normalizedAssignedClassTypeIds,
      );
    }
    const nextDateOfBirth = this.resolveDateOfBirthForUpdate(
      dto.age,
      dto.birthday,
      dto.age !== undefined,
      dto.birthday !== undefined,
    );
    const userData = {
      ...(dto.email !== undefined && { email: dto.email.toLowerCase().trim() }),
      ...(dto.name !== undefined && { name: dto.name.trim() }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName.trim() }),
      ...(normalizedPhone !== undefined && { phone: normalizedPhone }),
      ...(nextDateOfBirth !== undefined && { dateOfBirth: nextDateOfBirth }),
      ...(normalizedPhotoUrl !== undefined && {
        avatarUrl: normalizedPhotoUrl,
      }),
    };
    const profileData = {
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.specialization !== undefined && {
        specialization: normalizedSpecialization,
      }),
      ...(dto.classType !== undefined && {
        classType: normalizedClassType,
      }),
      ...(dto.experienceYears !== undefined && {
        experienceYears: dto.experienceYears,
      }),
      ...(normalizedAssignedClassTypeIds !== undefined && {
        assignedClassTypeIds: normalizedAssignedClassTypeIds,
      }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    };
    if (
      Object.keys(userData).length === 0 &&
      Object.keys(profileData).length === 0 &&
      normalizedSchedule === undefined
    ) {
      throw new BadRequestException('No updatable fields were provided');
    }
    let updated: CoachUpdateResult;
    try {
      updated = (await this.prisma.$transaction(async (tx) => {
        if (Object.keys(userData).length > 0) {
          await tx.user.update({
            where: { id: profile.user.id },
            data: userData,
          });
        }
        const coachUpdateSelect = {
          id: true,
          bio: true,
          specialization: true,
          classType: true,
          experienceYears: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              lastName: true,
              email: true,
              phone: true,
              avatarUrl: true,
            },
          },
          ...({
            assignedClassTypeIds: true,
            availabilitySlots: {
              select: {
                id: true,
                slotDate: true,
                slotTime: true,
                availableSpots: true,
              },
              orderBy: [{ slotDate: 'asc' }, { slotTime: 'asc' }],
            },
          } as Record<string, unknown>),
        } as Prisma.CoachProfileSelect;
        return tx.coachProfile.update({
          where: { id: coachProfileId },
          data: {
            ...profileData,
            ...(normalizedSchedule !== undefined && {
              availabilitySlots: {
                deleteMany: {},
                createMany: {
                  data: normalizedSchedule,
                },
              },
            }),
          },
          select: coachUpdateSelect,
        });
      })) as unknown as CoachUpdateResult;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target =
          Array.isArray(error.meta?.target) &&
          error.meta.target.every((value) => typeof value === 'string')
            ? error.meta.target
            : [];
        if (target.includes('email')) {
          throw new ConflictException('Email already registered');
        }
        if (target.includes('phone')) {
          throw new ConflictException('Phone number already registered');
        }
        throw new ConflictException('Profile field must be unique');
      }
      throw error;
    }
    await this.audit.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'COACH_UPDATED',
      entityType: 'CoachProfile',
      entityId: coachProfileId,
      payload: dto,
    });
    return updated;
  }

  listAdmin() {
    const listAdminArgs = {
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
        } as Record<string, unknown>),
      },
      orderBy: { createdAt: 'desc' },
    } as Prisma.CoachProfileFindManyArgs;
    return this.prisma.coachProfile.findMany(listAdminArgs).then((rows) =>
      (rows as unknown as CoachAdminListRow[]).map((row) => ({
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
        age: this.calculateAgeFromDateOfBirth(row.user.dateOfBirth),
      })),
    );
  }

  private async assertValidCoachClassType(classType: string): Promise<void> {
    const exists = await this.prisma.scheduleItem.findFirst({
      where: { classType, isActive: true },
      select: { id: true },
    });
    if (!exists) {
      throw new BadRequestException('Class type is invalid');
    }
  }

  private normalizeAssignedClassTypeIds(
    classTypeIds: string[] | undefined,
  ): string[] {
    if (classTypeIds === undefined) {
      return [];
    }
    const normalized = Array.from(
      new Set(
        classTypeIds
          .map((value) => value.trim())
          .filter((value) => value.length > 0),
      ),
    );
    return normalized;
  }

  private async assertValidAssignedClassTypeIds(
    classTypeIds: string[],
  ): Promise<void> {
    if (classTypeIds.length === 0) {
      return;
    }
    const found = await this.prisma.classType.findMany({
      where: { id: { in: classTypeIds } },
      select: { id: true },
    });
    if (found.length !== classTypeIds.length) {
      throw new BadRequestException('Assigned classes include invalid values');
    }
  }

  private normalizeSchedule(schedule: CoachScheduleSlotDto[] | undefined): {
    slotDate: Date;
    slotTime: string;
    availableSpots: number;
  }[] {
    if (schedule === undefined) {
      return [];
    }
    return schedule.map((entry) => {
      const slotDate = this.parseBirthdayToDateOnly(entry.date);
      const slotTime = entry.time.trim();
      const availableSpots = Number(entry.spots);
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(slotTime)) {
        throw new BadRequestException('Schedule time must be in HH:mm format');
      }
      if (
        !Number.isInteger(availableSpots) ||
        availableSpots < COACH_AVAILABILITY_MIN_SPOTS ||
        availableSpots > COACH_AVAILABILITY_MAX_SPOTS
      ) {
        throw new BadRequestException('Schedule spots value is invalid');
      }
      return { slotDate, slotTime, availableSpots };
    });
  }

  private normalizePhotoUrl(
    photoUrl: string | undefined,
  ): string | null | undefined {
    if (photoUrl === undefined) {
      return undefined;
    }
    const value = photoUrl.trim();
    if (value.length === 0) {
      return null;
    }
    const isAbsolute =
      value.startsWith('https://') || value.startsWith('http://');
    const isLocalUpload = value.startsWith('/v1/uploads/');
    if (!isAbsolute && !isLocalUpload) {
      throw new BadRequestException(
        'Photo URL must be absolute or point to /v1/uploads/',
      );
    }
    return value;
  }

  private async removeOldCoachPhoto(
    previousUrl: string | null,
    nextUrl: string,
  ): Promise<void> {
    if (previousUrl === null || previousUrl === nextUrl) {
      return;
    }
    if (
      previousUrl.startsWith('https://') ||
      previousUrl.startsWith('http://')
    ) {
      await this.r2Storage.deleteObjectIfOwned(previousUrl);
      return;
    }
    if (!previousUrl.startsWith('/v1/uploads/coach-avatar/')) {
      return;
    }
    const absolutePath = absolutePathForStoredUpload(
      join(process.cwd(), 'uploads'),
      previousUrl,
    );
    if (!absolutePath) {
      return;
    }
    try {
      await unlink(absolutePath);
    } catch {
      // Old upload cleanup is best effort.
    }
  }

  private normalizePhone(phone: string): string {
    const normalizedPhone = phone.trim();
    const phoneDigits = normalizedPhone.replace(/\D/g, '');
    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      throw new BadRequestException('Invalid phone number');
    }
    return normalizedPhone;
  }

  private calculateAgeFromDateOfBirth(dateOfBirth: Date | null): number | null {
    if (!dateOfBirth) {
      return null;
    }
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDelta = today.getMonth() - dateOfBirth.getMonth();
    if (
      monthDelta < 0 ||
      (monthDelta === 0 && today.getDate() < dateOfBirth.getDate())
    ) {
      age -= 1;
    }
    return age;
  }

  async coachPanelSummary(userId: string) {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      return null;
    }
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const [todaySessions, bookedToday, waitlists] = await Promise.all([
      this.prisma.classSession.count({
        where: {
          coachId: profile.id,
          startsAt: { gte: todayStart, lt: todayEnd },
        },
      }),
      this.prisma.booking.count({
        where: {
          status: BookingStatus.BOOKED,
          session: {
            coachId: profile.id,
            startsAt: { gte: todayStart, lt: todayEnd },
          },
        },
      }),
      this.prisma.waitlistEntry.count({
        where: {
          status: WaitlistStatus.ACTIVE,
          session: { coachId: profile.id },
        },
      }),
    ]);

    return {
      coachProfileId: profile.id,
      todaySessions,
      bookedToday,
      activeWaitlistsForCoachSessions: waitlists,
    };
  }

  async salarySummary(userId: string) {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      return null;
    }
    const sessions = await this.prisma.classSession.findMany({
      where: {
        coachId: profile.id,
      },
      include: {
        bookings: {
          where: {
            status: BookingStatus.COMPLETED,
          },
        },
      },
      orderBy: { startsAt: 'desc' },
      take: 300,
    });
    const perAttendeeShareCents = 1000;
    const basePerSessionCents = 3000;
    const completedSessions = sessions.filter((s) => s.bookings.length > 0);
    const totalEarningsCents = completedSessions.reduce((sum, s) => {
      return (
        sum + basePerSessionCents + s.bookings.length * perAttendeeShareCents
      );
    }, 0);
    return {
      coachProfileId: profile.id,
      completedSessions: completedSessions.length,
      totalEarningsCents,
      basePerSessionCents,
      perAttendeeShareCents,
      pendingPayoutCents: Math.round(totalEarningsCents * 0.4),
      paidOutCents: Math.round(totalEarningsCents * 0.6),
    };
  }
}
