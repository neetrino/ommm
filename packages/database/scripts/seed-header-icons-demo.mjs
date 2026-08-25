/**
 * Dev seed: header icon demo data (calls + staff activity + class reviews).
 * Idempotent — re-run replaces previous seed rows tagged with SEED_MARKER.
 *
 * Usage (from packages/database):
 *   pnpm seed:header-icons
 */
import {
  BookingChannel,
  BookingStatus,
  CallTaskStatus,
  ClassSessionStatus,
  PrismaClient,
  Role,
  SessionReviewStatus,
  StaffActivityType,
} from '@prisma/client';

const prisma = new PrismaClient();
const SEED_MARKER = '[HEADER-ICONS-SEED]';
const SEED_EMAIL_PREFIX = 'seed.headericons.';
const STUDIO_TZ_OFFSET = '+04:00';

function ymdInStudio(daysFromToday) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Yerevan',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const year = Number(parts.find((p) => p.type === 'year')?.value);
  const month = Number(parts.find((p) => p.type === 'month')?.value);
  const day = Number(parts.find((p) => p.type === 'day')?.value);
  const utc = Date.UTC(year, month - 1, day + daysFromToday);
  const d = new Date(utc);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function atStudio(ymd, hm) {
  return new Date(`${ymd}T${hm}:00${STUDIO_TZ_OFFSET}`);
}

async function resolveStaffAuthor() {
  const staff = await prisma.user.findFirst({
    where: { role: { in: [Role.ADMIN, Role.MANAGER] }, isBlocked: false },
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true },
  });
  if (!staff) {
    throw new Error('No ADMIN/MANAGER user found — create one before seeding.');
  }
  return staff;
}

async function resolveCoachAndClassType() {
  const coach = await prisma.coachProfile.findFirst({
    where: { isActive: true },
    include: { user: { select: { name: true, lastName: true } } },
  });
  if (!coach) {
    throw new Error('No active coach found — create a coach before seeding.');
  }
  const classType = await prisma.classType.findFirst({
    where: { archivedAt: null },
    orderBy: { name: 'asc' },
  });
  if (!classType) {
    throw new Error('No ClassType found — create a class type before seeding.');
  }
  return { coach, classType };
}

async function upsertSeedMember(index, name, lastName) {
  const email = `${SEED_EMAIL_PREFIX}${index}@ommm.local`;
  return prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      lastName,
      role: Role.USER,
      emailVerified: new Date(),
    },
    update: { name, lastName, isBlocked: false },
  });
}

async function cleanupPrevious(seedUserIds) {
  const seedBookings = await prisma.booking.findMany({
    where: { userId: { in: seedUserIds } },
    select: { id: true, sessionId: true },
  });
  const bookingIds = seedBookings.map((b) => b.id);
  const sessionIds = [...new Set(seedBookings.map((b) => b.sessionId))];
  if (bookingIds.length > 0) {
    await prisma.sessionReview.deleteMany({
      where: { bookingId: { in: bookingIds } },
    });
    await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
  }
  const markedSessions = await prisma.classSession.findMany({
    where: { title: { contains: SEED_MARKER } },
    select: { id: true },
  });
  const allSessionIds = [
    ...new Set([...sessionIds, ...markedSessions.map((s) => s.id)]),
  ];
  if (allSessionIds.length > 0) {
    await prisma.classSession.deleteMany({
      where: { id: { in: allSessionIds } },
    });
  }

  await prisma.callTask.deleteMany({
    where: {
      phone: {
        in: [
          '+37491000111',
          '+37499222333',
          '+37477444555',
          '+37455666777',
          '+37493888999',
          '+37498111222',
        ],
      },
    },
  });
  await prisma.staffActivityNotification.deleteMany({
    where: { memberUserId: { in: seedUserIds } },
  });
}

async function seedCallTasks(createdById) {
  const today = ymdInStudio(0);
  const yesterday = ymdInStudio(-1);
  const tomorrow = ymdInStudio(1);
  const twoDaysAgo = ymdInStudio(-2);
  const threeDaysAgo = ymdInStudio(-3);

  const rows = [
    {
      contactName: 'Nare Grigoryan',
      phone: '+37491000111',
      comment: `Asked about package renewal — call back today.`,
      dueOn: atStudio(today, '00:00'),
      status: CallTaskStatus.PENDING,
      completedAt: null,
    },
    {
      contactName: 'Arman Mkrtchyan',
      phone: '+37499222333',
      comment: `Missed trial class follow-up.`,
      dueOn: atStudio(yesterday, '00:00'),
      status: CallTaskStatus.PENDING,
      completedAt: null,
    },
    {
      contactName: 'Sona Danielyan',
      phone: '+37477444555',
      comment: `Wants to switch to evening class.`,
      dueOn: atStudio(today, '00:00'),
      status: CallTaskStatus.PENDING,
      completedAt: null,
    },
    {
      contactName: 'Lilit Hakobyan',
      phone: '+37455666777',
      comment: `Gift card balance question.`,
      dueOn: atStudio(tomorrow, '00:00'),
      status: CallTaskStatus.PENDING,
      completedAt: null,
    },
    {
      contactName: 'David Petrosyan',
      phone: '+37493888999',
      comment: `Confirmed booking for Saturday — no further action.`,
      dueOn: atStudio(twoDaysAgo, '00:00'),
      status: CallTaskStatus.DONE,
      completedAt: new Date(),
    },
    {
      contactName: 'Ani Karapetyan',
      phone: '+37498111222',
      comment: `Duplicate task — cancelled.`,
      dueOn: atStudio(threeDaysAgo, '00:00'),
      status: CallTaskStatus.CANCELLED,
      completedAt: null,
    },
  ];

  for (const row of rows) {
    await prisma.callTask.create({
      data: {
        ...row,
        createdById,
      },
    });
  }
  return rows.filter((r) => r.status === CallTaskStatus.PENDING).length;
}

async function seedStaffActivity(members, sessionStartsAt) {
  const now = Date.now();
  const rows = [
    {
      type: StaffActivityType.BOOKING_CREATED,
      member: members[0],
      className: 'Morning Yoga',
      minutesAgo: 0,
    },
    {
      type: StaffActivityType.BOOKING_CANCELLED,
      member: members[1],
      className: 'Pilates Reformer',
      minutesAgo: 20,
    },
    {
      type: StaffActivityType.BOOKING_CREATED,
      member: members[2],
      className: 'Sound Bath',
      minutesAgo: 50,
    },
    {
      type: StaffActivityType.BOOKING_CANCELLED,
      member: members[3],
      className: 'Hot Yoga',
      minutesAgo: 65,
    },
    {
      type: StaffActivityType.BOOKING_CREATED,
      member: members[4],
      className: 'Vinyasa Flow',
      minutesAgo: 100,
    },
  ];

  for (const row of rows) {
    const displayName = [row.member.name, row.member.lastName]
      .filter(Boolean)
      .join(' ');
    await prisma.staffActivityNotification.create({
      data: {
        type: row.type,
        memberUserId: row.member.id,
        memberName: displayName,
        className: row.className,
        sessionStartsAt,
        createdAt: new Date(now - row.minutesAgo * 60_000),
        staffReadAt: null,
      },
    });
  }
  return rows.length;
}

async function seedSessionReviews(coach, classType, members) {
  const tomorrow = ymdInStudio(1);
  const startsAt = atStudio(tomorrow, '09:00');
  const endsAt = atStudio(tomorrow, '10:00');
  const reviewSpecs = [
    {
      member: members[0],
      title: 'Evening Flow',
      classTypeName: 'Vinyasa Flow',
      rating: 5,
      comment: 'Calm cues and great playlist.',
      isAnonymous: false,
    },
    {
      member: members[1],
      title: 'Midday Heat',
      classTypeName: 'Hot Yoga',
      rating: 4,
      comment: null,
      isAnonymous: true,
    },
    {
      member: members[2],
      title: 'Core Strength',
      classTypeName: 'Pilates',
      rating: 5,
      comment: 'Perfect pace for beginners.',
      isAnonymous: false,
    },
  ];

  for (const spec of reviewSpecs) {
    let type = await prisma.classType.findFirst({
      where: {
        name: { equals: spec.classTypeName, mode: 'insensitive' },
        archivedAt: null,
      },
    });
    if (!type) {
      type = classType;
    }
    const session = await prisma.classSession.create({
      data: {
        title: spec.title,
        classTypeId: type.id,
        coachId: coach.id,
        startsAt,
        endsAt,
        capacity: 12,
        status: ClassSessionStatus.ACTIVE,
      },
    });
    const booking = await prisma.booking.create({
      data: {
        userId: spec.member.id,
        sessionId: session.id,
        status: BookingStatus.BOOKED,
        channel: BookingChannel.WEBSITE,
        attendedAt: endsAt,
      },
    });
    await prisma.sessionReview.create({
      data: {
        bookingId: booking.id,
        authorUserId: spec.member.id,
        sessionId: session.id,
        coachProfileId: coach.id,
        isAnonymous: spec.isAnonymous,
        rating: spec.rating,
        comment: spec.comment,
        status: SessionReviewStatus.SUBMITTED,
        submittedAt: new Date(),
        staffReadAt: null,
      },
    });
  }
  return reviewSpecs.length;
}

async function main() {
  const author = await resolveStaffAuthor();
  const { coach, classType } = await resolveCoachAndClassType();
  const members = await Promise.all([
    upsertSeedMember(1, 'Anna', 'Petrosyan'),
    upsertSeedMember(2, 'David', 'Hakobyan'),
    upsertSeedMember(3, 'Lilit', 'Sargsyan'),
    upsertSeedMember(4, 'Gor', 'Avetisyan'),
    upsertSeedMember(5, 'Mariam', 'Karapetyan'),
  ]);

  await cleanupPrevious(members.map((m) => m.id));

  const sessionStartsAt = atStudio(ymdInStudio(1), '13:00');
  const pendingCalls = await seedCallTasks(author.id);
  const activityCount = await seedStaffActivity(members, sessionStartsAt);
  const reviewCount = await seedSessionReviews(coach, classType, members);

  console.log(
    JSON.stringify(
      {
        ok: true,
        authorEmail: author.email,
        pendingCallTasks: pendingCalls,
        staffActivity: activityCount,
        sessionReviews: reviewCount,
        note: 'Re-run safe. Frontend preview flag should be removed.',
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
