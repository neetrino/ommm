import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { normalizeOptionalPhone } from '../common/phone';
import {
  COACH_AVAILABILITY_MAX_SPOTS,
  COACH_AVAILABILITY_MIN_SPOTS,
  type CoachScheduleSlotDto,
} from './dto/coach-schedule-slot.dto';
import type { UpdateCoachDto } from './dto/update-coach.dto';
import type { NormalizedScheduleSlot } from './coaches.types';

export function approximateDateOfBirthFromAge(ageYears: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - ageYears);
  return d;
}

export function parseBirthdayToDateOnly(value: string): Date {
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

export function calculateAgeFromDateOfBirth(
  dateOfBirth: Date | null,
): number | null {
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

export function resolveDateOfBirthFromInputs(
  age: number,
  birthday: string,
): Date {
  const fromBirthday = parseBirthdayToDateOnly(birthday);
  const computedAge = calculateAgeFromDateOfBirth(fromBirthday);
  if (computedAge !== null && Math.abs(computedAge - age) > 1) {
    throw new BadRequestException('Age does not match birthday');
  }
  return fromBirthday;
}

export function resolveDateOfBirthForUpdate(
  age: number | null | undefined,
  birthday: string | null | undefined,
  hasAge: boolean,
  hasBirthday: boolean,
): Date | null | undefined {
  if (hasBirthday) {
    if (birthday === null) {
      return null;
    }
    const date = parseBirthdayToDateOnly(birthday ?? '');
    if (hasAge && age !== undefined && age !== null) {
      const computedAge = calculateAgeFromDateOfBirth(date);
      if (computedAge !== null && Math.abs(computedAge - age) > 1) {
        throw new BadRequestException('Age does not match birthday');
      }
    }
    return date;
  }
  if (hasAge && age !== undefined && age !== null) {
    return approximateDateOfBirthFromAge(age);
  }
  return undefined;
}

/** Coach workspace may only patch the shared public bio field on their own profile. */
export function assertCoachSelfUpdateFields(dto: UpdateCoachDto): void {
  const disallowed = (Object.keys(dto) as (keyof UpdateCoachDto)[]).filter(
    (key) => key !== 'bio',
  );
  if (disallowed.length > 0) {
    throw new ForbiddenException('Coaches can only update bio');
  }
}

export function normalizeAssignedClassTypeIds(
  classTypeIds: string[] | undefined,
): string[] {
  if (classTypeIds === undefined) {
    return [];
  }
  return Array.from(
    new Set(
      classTypeIds
        .map((value) => value.trim())
        .filter((value) => value.length > 0),
    ),
  );
}

export function normalizeOptionalText(value: string | null): string | null {
  if (value === null) {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function normalizeSchedule(
  schedule: CoachScheduleSlotDto[] | undefined,
): NormalizedScheduleSlot[] {
  if (schedule === undefined) {
    return [];
  }
  const seen = new Set<string>();
  return schedule.map((entry) => {
    const slotDate = parseBirthdayToDateOnly(entry.date);
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
    const key = `${slotDate.toISOString().slice(0, 10)}|${slotTime}`;
    if (seen.has(key)) {
      throw new BadRequestException(
        'Duplicate availability slots are not allowed',
      );
    }
    seen.add(key);
    return { slotDate, slotTime, availableSpots };
  });
}

export function normalizePhotoUrl(
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

export function rethrowCoachUpdateUniqueViolation(error: unknown): never {
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

export function rethrowCoachDeleteForeignKeyViolation(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2003'
  ) {
    throw new BadRequestException(
      'This coach account has linked records and cannot be deleted. Deactivate instead.',
    );
  }
  throw error;
}

export type CoachUpdateNormalizedFields = {
  normalizedPhone: string | null | undefined;
  normalizedSpecialization: string | null | undefined;
  normalizedClassType: string | null | undefined;
  normalizedPhotoUrl: string | null | undefined;
  normalizedAssignedClassTypeIds: string[] | undefined;
  normalizedSchedule: NormalizedScheduleSlot[] | undefined;
};

export function normalizeCoachUpdateFields(
  dto: UpdateCoachDto,
): CoachUpdateNormalizedFields {
  return {
    normalizedPhone:
      dto.phone === undefined
        ? undefined
        : normalizeOptionalPhone(dto.phone ?? null),
    normalizedSpecialization:
      dto.specialization === undefined
        ? undefined
        : normalizeOptionalText(dto.specialization),
    normalizedClassType:
      dto.classType === undefined
        ? undefined
        : normalizeOptionalText(dto.classType),
    normalizedPhotoUrl:
      dto.photoUrl === undefined
        ? undefined
        : normalizePhotoUrl(dto.photoUrl),
    normalizedAssignedClassTypeIds:
      dto.assignedClassTypeIds === undefined
        ? undefined
        : normalizeAssignedClassTypeIds(dto.assignedClassTypeIds),
    normalizedSchedule:
      dto.schedule === undefined ? undefined : normalizeSchedule(dto.schedule),
  };
}

export function buildCoachUpdateUserData(
  dto: UpdateCoachDto,
  fields: CoachUpdateNormalizedFields,
  nextDateOfBirth: Date | null | undefined,
): Record<string, unknown> {
  return {
    ...(dto.email !== undefined && { email: dto.email.toLowerCase().trim() }),
    ...(dto.name !== undefined && {
      name: dto.name === null ? null : normalizeOptionalText(dto.name),
    }),
    ...(dto.lastName !== undefined && {
      lastName:
        dto.lastName === null ? null : normalizeOptionalText(dto.lastName),
    }),
    ...(fields.normalizedPhone !== undefined && {
      phone: fields.normalizedPhone,
    }),
    ...(nextDateOfBirth !== undefined && { dateOfBirth: nextDateOfBirth }),
    ...(fields.normalizedPhotoUrl !== undefined && {
      avatarUrl: fields.normalizedPhotoUrl,
    }),
  };
}

export function buildCoachUpdateProfileData(
  dto: UpdateCoachDto,
  fields: CoachUpdateNormalizedFields,
): Record<string, unknown> {
  return {
    ...(dto.bio !== undefined && {
      bio: normalizeOptionalText(dto.bio),
    }),
    ...(dto.specialization !== undefined && {
      specialization: fields.normalizedSpecialization,
    }),
    ...(dto.classType !== undefined && {
      classType: fields.normalizedClassType,
    }),
    ...(dto.experienceYears !== undefined && {
      experienceYears: dto.experienceYears,
    }),
    ...(fields.normalizedAssignedClassTypeIds !== undefined && {
      assignedClassTypeIds: fields.normalizedAssignedClassTypeIds,
    }),
    ...(dto.isActive !== undefined && { isActive: dto.isActive }),
  };
}
