import {
  PrismaClient,
  Role,
  ClassSessionStatus,
  ContentStatus,
  ContentType,
} from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await argon2.hash("Demo1234!", { type: argon2.argon2id });

  await prisma.user.upsert({
    where: { email: "admin@ommm.local" },
    update: {},
    create: {
      email: "admin@ommm.local",
      passwordHash,
      name: "Admin",
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  const coachUser = await prisma.user.upsert({
    where: { email: "coach@ommm.local" },
    update: {},
    create: {
      email: "coach@ommm.local",
      passwordHash,
      name: "Coach Demo",
      role: Role.COACH,
      emailVerified: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: "member@ommm.local" },
    update: {},
    create: {
      email: "member@ommm.local",
      passwordHash,
      name: "Member Demo",
      role: Role.USER,
      emailVerified: new Date(),
    },
  });

  const coachProfile = await prisma.coachProfile.upsert({
    where: { userId: coachUser.id },
    update: { bio: "Demo instructor", specialization: "Reformer", isActive: true },
    create: {
      userId: coachUser.id,
      bio: "Demo instructor",
      specialization: "Reformer",
      experienceYears: 5,
      isActive: true,
    },
  });

  const studioCount = await prisma.studioSettings.count();
  if (studioCount === 0) {
    await prisma.studioSettings.create({
      data: {
        studioName: "Ommm",
        contactEmail: "hello@ommm.am",
        contactPhone: "+37400000000",
        address: "Yerevan",
        cancellationHoursNotice: 24,
        waitlistOfferMinutes: 30,
      },
    });
  }

  await prisma.membershipPlan.upsert({
    where: { slug: "monthly-8" },
    update: {},
    create: {
      name: "Monthly 8",
      slug: "monthly-8",
      description: "8 sessions / month",
      priceCents: 480_000,
      sessionsPerMonth: 8,
      isUnlimited: false,
      periodDays: 30,
    },
  });

  for (const a of [
    { key: "first_class", title: "First class", threshold: 1 },
    { key: "classes_5", title: "5 classes", threshold: 5 },
    { key: "classes_10", title: "10 classes", threshold: 10 },
  ]) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      update: {},
      create: {
        key: a.key,
        title: a.title,
        description: `Complete ${a.threshold} classes`,
        threshold: a.threshold,
      },
    });
  }

  const classType = await prisma.classType.upsert({
    where: { slug: "reformer" },
    update: {},
    create: {
      name: "Reformer Pilates",
      slug: "reformer",
      description: "Full-body reformer session",
    },
  });

  const existingDemoSession = await prisma.classSession.findFirst({
    where: { coachId: coachProfile.id, classTypeId: classType.id },
  });

  if (!existingDemoSession) {
    const starts = new Date();
    starts.setDate(starts.getDate() + 1);
    starts.setHours(10, 0, 0, 0);
    const ends = new Date(starts);
    ends.setMinutes(ends.getMinutes() + 50);

    await prisma.classSession.create({
      data: {
        classTypeId: classType.id,
        coachId: coachProfile.id,
        startsAt: starts,
        endsAt: ends,
        capacity: 10,
        level: "Open",
        priceCents: 8_000,
        status: ClassSessionStatus.ACTIVE,
      },
    });
  }

  await prisma.contentPost.upsert({
    where: { slug: "welcome-event" },
    update: {},
    create: {
      type: ContentType.EVENT,
      status: ContentStatus.PUBLISHED,
      slug: "welcome-event",
      title: "Open studio day",
      excerpt: "Join us for a trial class.",
      body: "Details coming soon.",
      publishedAt: new Date(),
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e: unknown) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
