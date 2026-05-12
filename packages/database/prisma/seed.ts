import {
  PrismaClient,
  Role,
  ClassSessionStatus,
  ContentStatus,
  ContentType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_USER_PASSWORD = "Demo1234!";
const BCRYPT_SALT_ROUNDS = 12;

/** One demo login per `Role` enum value; password: DEMO_USER_PASSWORD */
const DEMO_USERS_BY_ROLE: ReadonlyArray<{ email: string; name: string; role: Role }> = [
  { email: "admin@ommm.local", name: "Admin", role: Role.ADMIN },
  { email: "manager@ommm.local", name: "Manager Demo", role: Role.MANAGER },
  { email: "content-admin@ommm.local", name: "Content Admin Demo", role: Role.CONTENT_ADMIN },
  { email: "coach@ommm.local", name: "Coach Demo", role: Role.COACH },
  { email: "member@ommm.local", name: "Member Demo", role: Role.USER },
];

async function seedDemoRoleUsers(passwordHash: string): Promise<void> {
  for (const acc of DEMO_USERS_BY_ROLE) {
    await prisma.user.upsert({
      where: { email: acc.email },
      update: { name: acc.name, role: acc.role, passwordHash },
      create: {
        email: acc.email,
        passwordHash,
        name: acc.name,
        role: acc.role,
        emailVerified: new Date(),
      },
    });
  }
}

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_USER_PASSWORD, BCRYPT_SALT_ROUNDS);

  await seedDemoRoleUsers(passwordHash);

  const coachUser = await prisma.user.findUniqueOrThrow({
    where: { email: "coach@ommm.local" },
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
