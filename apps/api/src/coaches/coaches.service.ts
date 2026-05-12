import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Role, WaitlistStatus, type User } from '@prisma/client';
import { hashPassword } from '../common/password-crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateCoachDto } from './dto/create-coach.dto';
import type { UpdateCoachDto } from './dto/update-coach.dto';

@Injectable()
export class CoachesService {
  constructor(private readonly prisma: PrismaService) {}

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
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      throw new BadRequestException('Invalid phone number');
    }

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
          specialization: dto.specialization,
          experienceYears: dto.experienceYears,
        },
        include: {
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
    return this.prisma.coachProfile.update({
      where: { id: coachProfileId },
      data: dto,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  listAdmin() {
    return this.prisma.coachProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
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
}
