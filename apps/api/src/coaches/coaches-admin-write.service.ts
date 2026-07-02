import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, type User } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PUBLIC_CACHE_KEYS } from '../cache/public-cache-keys';
import { RedisCacheService } from '../cache/redis-cache.service';
import { hashPassword } from '../common/password-crypto';
import { normalizeRequiredPhone } from '../common/phone';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateCoachDto } from './dto/create-coach.dto';
import type { UpdateCoachDto } from './dto/update-coach.dto';
import {
  assertCoachSelfUpdateFields,
  buildCoachUpdateProfileData,
  buildCoachUpdateUserData,
  normalizeAssignedClassTypeIds,
  normalizeCoachUpdateFields,
  normalizePhotoUrl,
  normalizeSchedule,
  rethrowCoachDeleteForeignKeyViolation,
  rethrowCoachUpdateUniqueViolation,
  resolveDateOfBirthForUpdate,
  resolveDateOfBirthFromInputs,
} from './coaches-profile.helpers';
import { CoachesPhotoService } from './coaches-photo.service';
import {
  coachCreateSelect,
  coachUpdateSelect,
  type CoachUpdateResult,
} from './coaches.types';

@Injectable()
export class CoachesAdminWriteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly photo: CoachesPhotoService,
    private readonly cache: RedisCacheService,
  ) {}

  async create(dto: CreateCoachDto) {
    const email = dto.email.toLowerCase().trim();
    const phone = normalizeRequiredPhone(dto.phone);
    const specialization = dto.specialization.trim();
    const classType = dto.classType.trim();
    const assignedClassTypeIds = normalizeAssignedClassTypeIds(
      dto.assignedClassTypeIds,
    );
    const availabilitySlots = normalizeSchedule(dto.schedule);
    const normalizedPhotoUrl = normalizePhotoUrl(dto.photoUrl);
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
    const dateOfBirth = resolveDateOfBirthFromInputs(dto.age, dto.birthday);

    const created = await this.prisma.$transaction(async (tx) => {
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
      return tx.coachProfile.create({
        data: coachCreateData,
        select: coachCreateSelect,
      });
    });
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.coaches);
    return created;
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
    if (actor.role === Role.COACH) {
      assertCoachSelfUpdateFields(dto);
    }
    if (actor.role === Role.MANAGER && dto.isActive === false) {
      throw new ForbiddenException('Managers cannot deactivate coaches');
    }
    const fields = normalizeCoachUpdateFields(dto);
    const {
      normalizedClassType,
      normalizedAssignedClassTypeIds,
      normalizedSchedule,
    } = fields;
    if (normalizedClassType !== undefined && normalizedClassType !== null) {
      await this.assertValidCoachClassType(normalizedClassType);
    }
    if (normalizedAssignedClassTypeIds !== undefined) {
      await this.assertValidAssignedClassTypeIds(
        normalizedAssignedClassTypeIds,
      );
    }
    const nextDateOfBirth = resolveDateOfBirthForUpdate(
      dto.age,
      dto.birthday,
      dto.age !== undefined,
      dto.birthday !== undefined,
    );
    const userData = buildCoachUpdateUserData(dto, fields, nextDateOfBirth);
    const profileData = buildCoachUpdateProfileData(dto, fields);
    if (
      Object.keys(userData).length === 0 &&
      Object.keys(profileData).length === 0 &&
      normalizedSchedule === undefined
    ) {
      throw new BadRequestException('No updatable fields were provided');
    }
    let updated: CoachUpdateResult;
    try {
      updated = await this.prisma.$transaction(async (tx) => {
        if (Object.keys(userData).length > 0) {
          await tx.user.update({
            where: { id: profile.user.id },
            data: userData,
          });
        }
        return tx.coachProfile.update({
          where: { id: coachProfileId },
          data: {
            ...profileData,
            ...(normalizedSchedule !== undefined && {
              availabilitySlots: {
                deleteMany: {},
                ...(normalizedSchedule.length > 0 && {
                  createMany: {
                    data: normalizedSchedule,
                  },
                }),
              },
            }),
          },
          select: coachUpdateSelect,
        });
      });
    } catch (error) {
      rethrowCoachUpdateUniqueViolation(error);
    }
    await this.audit.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'COACH_UPDATED',
      entityType: 'CoachProfile',
      entityId: coachProfileId,
      payload: dto,
    });
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.coaches);
    return updated;
  }

  async remove(actor: User, coachProfileId: string): Promise<void> {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { id: coachProfileId },
      include: {
        user: { select: { id: true, avatarUrl: true } },
        _count: { select: { sessions: true } },
      },
    });
    if (!profile) {
      throw new NotFoundException('Coach profile not found');
    }
    if (profile._count.sessions > 0) {
      throw new BadRequestException(
        'Cannot delete a coach assigned to class sessions. Deactivate the coach instead.',
      );
    }

    const avatarUrl = profile.user.avatarUrl;

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.classSession.updateMany({
          where: { substituteCoachId: coachProfileId },
          data: { substituteCoachId: null },
        });
        await tx.coachProfile.delete({ where: { id: coachProfileId } });
        await tx.user.delete({ where: { id: profile.user.id } });
      });
    } catch (error) {
      rethrowCoachDeleteForeignKeyViolation(error);
    }

    await this.photo.removeOldCoachPhoto(avatarUrl, '');
    await this.audit.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'COACH_DELETED',
      entityType: 'CoachProfile',
      entityId: coachProfileId,
    });
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.coaches);
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
}
