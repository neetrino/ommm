import {
  BookingChannel,
  BookingStatus,
  PrismaClient,
  SessionReviewStatus,
} from "@prisma/client";

const prisma = new PrismaClient();
const TARGET_EMAIL = "gurgenginosyan7@gmail.com";

type Sample = {
  key: string;
  classTypeId: string;
  classTypeName: string;
  endsAgoDays: number;
  durationMin: number;
} & (
  | { status: "PENDING" }
  | {
      status: "SUBMITTED";
      rating: number;
      comment: string;
      isAnonymous: boolean;
    }
);

async function main(): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: TARGET_EMAIL },
    select: { id: true, email: true, role: true, name: true, lastName: true },
  });
  if (!user) {
    throw new Error(`User not found: ${TARGET_EMAIL}`);
  }
  console.log("User:", user.email, user.role, user.id);

  const coach = await prisma.coachProfile.findFirst({
    where: { isActive: true },
    include: { user: { select: { name: true, lastName: true } } },
    orderBy: { createdAt: "asc" },
  });
  if (!coach) {
    throw new Error("No active coach profile found");
  }
  console.log("Coach:", coach.id, coach.user.name);

  const classTypes = await prisma.classType.findMany({
    where: { archivedAt: null },
    take: 4,
    orderBy: { name: "asc" },
  });
  if (classTypes.length === 0) {
    throw new Error("No class types found");
  }

  const t0 = classTypes[0]!;
  const t1 = classTypes[1] ?? t0;
  const t2 = classTypes[2] ?? t0;
  const t3 = classTypes[3] ?? t0;

  const samples: Sample[] = [
    {
      key: "ui-review-pending-1",
      classTypeId: t0.id,
      classTypeName: t0.name,
      endsAgoDays: 1,
      durationMin: 60,
      status: "PENDING",
    },
    {
      key: "ui-review-pending-2",
      classTypeId: t1.id,
      classTypeName: t1.name,
      endsAgoDays: 0.5,
      durationMin: 60,
      status: "PENDING",
    },
    {
      key: "ui-review-named-5",
      classTypeId: t1.id,
      classTypeName: t1.name,
      endsAgoDays: 2,
      durationMin: 55,
      status: "SUBMITTED",
      rating: 5,
      comment: "Loved the pace and cues. Felt strong after class.",
      isAnonymous: false,
    },
    {
      key: "ui-review-anon-4",
      classTypeId: t2.id,
      classTypeName: t2.name,
      endsAgoDays: 3,
      durationMin: 50,
      status: "SUBMITTED",
      rating: 4,
      comment: "Great class, but the room was a bit cold.",
      isAnonymous: true,
    },
    {
      key: "ui-review-named-5b",
      classTypeId: t3.id,
      classTypeName: t3.name,
      endsAgoDays: 4,
      durationMin: 75,
      status: "SUBMITTED",
      rating: 5,
      comment: "Best session this month — thank you!",
      isAnonymous: false,
    },
    {
      key: "ui-review-anon-3",
      classTypeId: t0.id,
      classTypeName: t0.name,
      endsAgoDays: 5,
      durationMin: 45,
      status: "SUBMITTED",
      rating: 3,
      comment: "Enjoyed it, but would like more beginner options.",
      isAnonymous: true,
    },
  ];

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (const sample of samples) {
    const endsAt = new Date(now - sample.endsAgoDays * dayMs);
    const startsAt = new Date(endsAt.getTime() - sample.durationMin * 60 * 1000);
    const sessionId = `seed-ui-session-${sample.key}`;
    const bookingId = `seed-ui-booking-${sample.key}`;
    const reviewId = `seed-ui-review-${sample.key}`;

    await prisma.classSession.upsert({
      where: { id: sessionId },
      update: {
        title: sample.classTypeName,
        classTypeId: sample.classTypeId,
        coachId: coach.id,
        startsAt,
        endsAt,
        capacity: 12,
        status: "ACTIVE",
      },
      create: {
        id: sessionId,
        title: sample.classTypeName,
        classTypeId: sample.classTypeId,
        coachId: coach.id,
        startsAt,
        endsAt,
        capacity: 12,
        status: "ACTIVE",
      },
    });

    await prisma.booking.upsert({
      where: { id: bookingId },
      update: {
        userId: user.id,
        sessionId,
        status: BookingStatus.COMPLETED,
        channel: BookingChannel.WEBSITE,
        attendedAt: endsAt,
      },
      create: {
        id: bookingId,
        userId: user.id,
        sessionId,
        status: BookingStatus.COMPLETED,
        channel: BookingChannel.WEBSITE,
        attendedAt: endsAt,
      },
    });

    if (sample.status === "PENDING") {
      await prisma.sessionReview.upsert({
        where: { bookingId },
        update: {
          authorUserId: user.id,
          sessionId,
          coachProfileId: coach.id,
          status: SessionReviewStatus.PENDING,
          rating: null,
          comment: null,
          isAnonymous: false,
          submittedAt: null,
          staffReadAt: null,
          promptedAt: endsAt,
        },
        create: {
          id: reviewId,
          bookingId,
          authorUserId: user.id,
          sessionId,
          coachProfileId: coach.id,
          status: SessionReviewStatus.PENDING,
          promptedAt: endsAt,
        },
      });
      console.log(`PENDING  · ${sample.classTypeName}`);
      continue;
    }

    await prisma.sessionReview.upsert({
      where: { bookingId },
      update: {
        authorUserId: user.id,
        sessionId,
        coachProfileId: coach.id,
        status: SessionReviewStatus.SUBMITTED,
        rating: sample.rating,
        comment: sample.comment,
        isAnonymous: sample.isAnonymous,
        submittedAt: endsAt,
        staffReadAt: null,
        promptedAt: endsAt,
      },
      create: {
        id: reviewId,
        bookingId,
        authorUserId: user.id,
        sessionId,
        coachProfileId: coach.id,
        status: SessionReviewStatus.SUBMITTED,
        rating: sample.rating,
        comment: sample.comment,
        isAnonymous: sample.isAnonymous,
        submittedAt: endsAt,
        promptedAt: endsAt,
      },
    });
    console.log(
      `SUBMITTED · ${sample.classTypeName} · ${sample.rating}/5 · anon=${sample.isAnonymous}`,
    );
  }

  const pending = await prisma.sessionReview.count({
    where: { authorUserId: user.id, status: SessionReviewStatus.PENDING },
  });
  const submitted = await prisma.sessionReview.count({
    where: { authorUserId: user.id, status: SessionReviewStatus.SUBMITTED },
  });
  console.log(`Done. pending=${pending} submitted=${submitted}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
