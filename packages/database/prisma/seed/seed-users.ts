import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  BCRYPT_SALT_ROUNDS,
  DEMO_USER_PASSWORD,
  DEMO_USERS_BY_ROLE,
  EXTRA_COACH_USERS,
  EXTRA_MEMBER_USERS,
  type DemoUserSeed,
} from "./constants";

export type SeededCoachProfile = {
  userId: string;
  profileId: string;
  email: string;
  specialization: string;
  classTypeSlug: string;
};

export type SeededUsers = {
  byEmail: Map<string, { id: string; email: string; role: Role }>;
  coaches: SeededCoachProfile[];
  adminId: string;
  memberId: string;
};

async function upsertDemoUser(
  prisma: PrismaClient,
  user: DemoUserSeed,
  passwordHash: string,
): Promise<{ id: string; email: string; role: Role }> {
  const record = await prisma.user.upsert({
    where: { email: user.email },
    update: {
      name: user.name,
      lastName: user.lastName,
      role: user.role,
      passwordHash,
      locale: user.locale ?? "hy",
      isBlocked: user.isBlocked ?? false,
      emailVerified: new Date(),
    },
    create: {
      email: user.email,
      passwordHash,
      name: user.name,
      lastName: user.lastName,
      role: user.role,
      locale: user.locale ?? "hy",
      isBlocked: user.isBlocked ?? false,
      emailVerified: new Date(),
    },
    select: { id: true, email: true, role: true },
  });
  return record;
}

const COACH_PROFILE_SEEDS: ReadonlyArray<{
  email: string;
  bio: string;
  specialization: string;
  classTypeSlug: string;
  experienceYears: number;
}> = [
  {
    email: "coach@ommm.local",
    bio: "Reformer artist with a calm, precise teaching style.",
    specialization: "Reformer Group",
    classTypeSlug: "reformer-group",
    experienceYears: 8,
  },
  {
    email: "coach2@ommm.local",
    bio: "Private reformer coach focused on posture and athletic recovery.",
    specialization: "Reformer Individual",
    classTypeSlug: "reformer-individual",
    experienceYears: 6,
  },
  {
    email: "coach3@ommm.local",
    bio: "Yoga and mat pilates guide — breath-first, alignment always.",
    specialization: "Yoga & Mat Pilates",
    classTypeSlug: "yoga",
    experienceYears: 10,
  },
];

export async function seedUsers(prisma: PrismaClient): Promise<SeededUsers> {
  const passwordHash = await bcrypt.hash(DEMO_USER_PASSWORD, BCRYPT_SALT_ROUNDS);
  const allUsers = [...DEMO_USERS_BY_ROLE, ...EXTRA_MEMBER_USERS, ...EXTRA_COACH_USERS];
  const byEmail = new Map<string, { id: string; email: string; role: Role }>();

  for (const user of allUsers) {
    const record = await upsertDemoUser(prisma, user, passwordHash);
    byEmail.set(record.email, record);
    await prisma.notificationPreference.upsert({
      where: { userId: record.id },
      update: {},
      create: {
        userId: record.id,
        bookingReminders: true,
        waitlistAlerts: true,
        promotions: record.role === Role.USER,
        communityUpdates: true,
      },
    });
  }

  const coaches: SeededCoachProfile[] = [];
  for (const coachSeed of COACH_PROFILE_SEEDS) {
    const user = byEmail.get(coachSeed.email);
    if (user === undefined) {
      continue;
    }
    const profile = await prisma.coachProfile.upsert({
      where: { userId: user.id },
      update: {
        bio: coachSeed.bio,
        specialization: coachSeed.specialization,
        experienceYears: coachSeed.experienceYears,
        isActive: true,
      },
      create: {
        userId: user.id,
        bio: coachSeed.bio,
        specialization: coachSeed.specialization,
        experienceYears: coachSeed.experienceYears,
        isActive: true,
      },
    });
    coaches.push({
      userId: user.id,
      profileId: profile.id,
      email: coachSeed.email,
      specialization: coachSeed.specialization,
      classTypeSlug: coachSeed.classTypeSlug,
    });
  }

  const admin = byEmail.get("admin@ommm.local");
  const member = byEmail.get("member@ommm.local");
  if (admin === undefined || member === undefined) {
    throw new Error("Seed users missing required admin or member account");
  }

  return { byEmail, coaches, adminId: admin.id, memberId: member.id };
}
