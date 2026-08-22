import { Prisma, Role } from '@prisma/client';

export const COACH_PHOTO_MAX_BYTES = 10 * 1024 * 1024;

export const COACH_PHOTO_MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export type CoachAvailabilitySlotRow = {
  id: string;
  slotDate: Date;
  slotTime: string;
  availableSpots: number;
};

export type CoachAdminListRow = {
  id: string;
  userId: string;
  bio: string | null;
  specialization: string | null;
  classType: string | null;
  assignedClassTypeIds: string[];
  experienceYears: number | null;
  salaryPerClassAmd: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  availabilitySlots: CoachAvailabilitySlotRow[];
  _count: {
    sessions: number;
    substituteSessions: number;
  };
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

export type CoachUpdateResult = {
  id: string;
  bio: string | null;
  specialization: string | null;
  classType: string | null;
  experienceYears: number | null;
  salaryPerClassAmd: number;
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
    dateOfBirth: Date | null;
    avatarUrl: string | null;
  };
};

export type NormalizedScheduleSlot = {
  slotDate: Date;
  slotTime: string;
  availableSpots: number;
};

const coachAvailabilitySlotsSelect = {
  assignedClassTypeIds: true,
  availabilitySlots: {
    select: {
      id: true,
      slotDate: true,
      slotTime: true,
      availableSpots: true,
    },
    orderBy: [{ slotDate: 'asc' as const }, { slotTime: 'asc' as const }],
  },
} as Record<string, unknown>;

export const coachCreateSelect = {
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
  ...coachAvailabilitySlotsSelect,
} as Prisma.CoachProfileSelect;

export const coachUpdateSelect = {
  id: true,
  bio: true,
  specialization: true,
  classType: true,
  experienceYears: true,
  salaryPerClassAmd: true,
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
      dateOfBirth: true,
      avatarUrl: true,
    },
  },
  ...coachAvailabilitySlotsSelect,
} as Prisma.CoachProfileSelect;
