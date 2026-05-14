import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BookingStatus, Role, WaitlistStatus, type User } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { hashPassword } from '../common/password-crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateCoachDto } from './dto/create-coach.dto';
import type { UpdateCoachDto } from './dto/update-coach.dto';

@Injectable()
export class CoachesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  listPublic() {
    return this.prisma.coachProfile.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  getPublic(id: string) {
    return this.prisma.coachProfile.findFirst({
      where: { id, isActive: true },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  async create(dto: CreateCoachDto) {
    const email = dto.email.toLowerCase().trim();
    const phone = dto.phone.trim();
    const specialization = dto.specialization.trim();
    const classType = dto.classType.trim();
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      throw new BadRequestException('Invalid phone number');
    }
    if (specialization.length === 0) {
      throw new BadRequestException('Specialization is required');
    }
    await this.assertValidCoachClassType(classType);

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
    const dateOfBirth = this.approximateDateOfBirthFromAge(dto.age);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: dto.name.trim(),
          lastName: dto.lastName.trim(),
          phone,
          dateOfBirth,
          role: Role.COACH,
          emailVerified: new Date(),
        },
      });
      return tx.coachProfile.create({
        data: {
          userId: user.id,
          bio: dto.bio,
          specialization,
          classType,
          experienceYears: dto.experienceYears,
        },
        select: {
          id: true,
          classType: true,
          user: {
            select: {
              id: true,
              name: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      });
    });
  }

  private approximateDateOfBirthFromAge(ageYears: number): Date {
    const d = new Date();
    d.setFullYear(d.getFullYear() - ageYears);
    return d;
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
    const userData = {
      ...(dto.email !== undefined && { email: dto.email.toLowerCase().trim() }),
      ...(dto.name !== undefined && { name: dto.name.trim() }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName.trim() }),
      ...(normalizedPhone !== undefined && { phone: normalizedPhone }),
      ...(dto.age !== undefined && {
        dateOfBirth: this.approximateDateOfBirthFromAge(dto.age),
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
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    };
    if (
      Object.keys(userData).length === 0 &&
      Object.keys(profileData).length === 0
    ) {
      throw new BadRequestException('No updatable fields were provided');
    }
    let updated: {
      id: string;
      bio: string | null;
      specialization: string | null;
      classType: string | null;
      experienceYears: number | null;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      userId: string;
      user: {
        id: string;
        name: string | null;
        email: string;
        lastName: string | null;
        phone: string | null;
      };
    };
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
          data: profileData,
          select: {
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
              },
            },
          },
        });
      });
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
    return this.prisma.coachProfile
      .findMany({
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
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      .then((rows) =>
        rows.map((row) => ({
          id: row.id,
          bio: row.bio,
          specialization: row.specialization,
          classType: row.classType,
          experienceYears: row.experienceYears,
          isActive: row.isActive,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          userId: row.userId,
          user: {
            id: row.user.id,
            name: row.user.name,
            lastName: row.user.lastName,
            email: row.user.email,
            phone: row.user.phone,
            role: row.user.role,
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
