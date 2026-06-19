import {
  BookingChannel,
  BookingStatus,
  PrismaClient,
  WaitlistStatus,
} from "@prisma/client";
import { addDays } from "./class-data";
import type { SeededUsers } from "./seed-users";

export async function seedBookingsForSessions(
  prisma: PrismaClient,
  users: SeededUsers,
  sessionIds: Map<string, string>,
): Promise<void> {
  const member = users.byEmail.get("member@ommm.local");
  const member2 = users.byEmail.get("member2@ommm.local");
  const member3 = users.byEmail.get("member3@ommm.local");
  const coachUser = users.byEmail.get("coach@ommm.local");
  if (member === undefined || member2 === undefined || member3 === undefined || coachUser === undefined) {
    throw new Error("Seed bookings missing required users");
  }

  await seedMemberBookings(prisma, member.id, sessionIds, coachUser.id);
  await seedMemberWaitlist(prisma, member.id, sessionIds, member2.id, member3.id);
  await seedClientNote(prisma, member.id, coachUser.id);
}

async function seedMemberBookings(
  prisma: PrismaClient,
  memberId: string,
  sessionIds: Map<string, string>,
  coachUserId: string,
): Promise<void> {
  const tomorrowSession = sessionIds.get("reformer-group-tomorrow-morning");
  const pastSession = sessionIds.get("reformer-group-past");
  const yogaSession = sessionIds.get("yoga-sunrise");
  const matSession = sessionIds.get("mat-pilates-core");
  const convertedSession = sessionIds.get("dances-waitlist-converted");

  if (tomorrowSession !== undefined) {
    await upsertBooking(prisma, {
      userId: memberId,
      sessionId: tomorrowSession,
      status: BookingStatus.BOOKED,
      channel: BookingChannel.WEBSITE,
    });
  }

  if (pastSession !== undefined) {
    const booking = await upsertBooking(prisma, {
      userId: memberId,
      sessionId: pastSession,
      status: BookingStatus.COMPLETED,
      channel: BookingChannel.WEBSITE,
      attendedAt: addDays(new Date(), -7),
    });
    await prisma.bookingNote.upsert({
      where: { id: `seed-note-${booking.id}` },
      update: { body: "Great control on the tower — keep shoulders relaxed." },
      create: {
        id: `seed-note-${booking.id}`,
        bookingId: booking.id,
        authorId: coachUserId,
        body: "Great control on the tower — keep shoulders relaxed.",
      },
    });
  }

  if (yogaSession !== undefined) {
    await upsertBooking(prisma, {
      userId: memberId,
      sessionId: yogaSession,
      status: BookingStatus.CANCELLED,
      channel: BookingChannel.WEBSITE,
      cancelledAt: addDays(new Date(), -1),
    });
  }

  if (matSession !== undefined) {
    await upsertBooking(prisma, {
      userId: memberId,
      sessionId: matSession,
      status: BookingStatus.MISSED,
      channel: BookingChannel.APP,
    });
  }

  if (convertedSession !== undefined) {
    await upsertBooking(prisma, {
      userId: memberId,
      sessionId: convertedSession,
      status: BookingStatus.BOOKED,
      channel: BookingChannel.APP,
    });
  }
}

async function seedMemberWaitlist(
  prisma: PrismaClient,
  memberId: string,
  sessionIds: Map<string, string>,
  fillerUser2Id: string,
  fillerUser3Id: string,
): Promise<void> {
  const now = new Date();
  const fullSession = sessionIds.get("reformer-group-full");
  const offeredSession = sessionIds.get("reformer-group-waitlist-offered");
  const expiredSession = sessionIds.get("yoga-waitlist-expired");
  const removedSession = sessionIds.get("mat-waitlist-removed");
  const convertedSession = sessionIds.get("dances-waitlist-converted");

  if (fullSession !== undefined) {
    await upsertBooking(prisma, {
      userId: fillerUser2Id,
      sessionId: fullSession,
      status: BookingStatus.BOOKED,
      channel: BookingChannel.WEBSITE,
    });
    await upsertBooking(prisma, {
      userId: fillerUser3Id,
      sessionId: fullSession,
      status: BookingStatus.BOOKED,
      channel: BookingChannel.WEBSITE,
    });
    await upsertWaitlist(prisma, {
      userId: memberId,
      sessionId: fullSession,
      position: 1,
      status: WaitlistStatus.ACTIVE,
    });
  }

  if (offeredSession !== undefined) {
    await upsertBooking(prisma, {
      userId: fillerUser2Id,
      sessionId: offeredSession,
      status: BookingStatus.BOOKED,
      channel: BookingChannel.WEBSITE,
    });
    await upsertBooking(prisma, {
      userId: fillerUser3Id,
      sessionId: offeredSession,
      status: BookingStatus.BOOKED,
      channel: BookingChannel.WEBSITE,
    });
    await upsertWaitlist(prisma, {
      userId: memberId,
      sessionId: offeredSession,
      position: 1,
      status: WaitlistStatus.OFFERED,
      offeredAt: addDays(now, -1),
      offerExpiresAt: addDays(now, 1),
    });
  }

  if (expiredSession !== undefined) {
    await upsertWaitlist(prisma, {
      userId: memberId,
      sessionId: expiredSession,
      position: 2,
      status: WaitlistStatus.EXPIRED,
      offeredAt: addDays(now, -5),
      offerExpiresAt: addDays(now, -4),
    });
  }

  if (removedSession !== undefined) {
    await upsertWaitlist(prisma, {
      userId: memberId,
      sessionId: removedSession,
      position: 3,
      status: WaitlistStatus.REMOVED,
    });
  }

  if (convertedSession !== undefined) {
    await upsertWaitlist(prisma, {
      userId: memberId,
      sessionId: convertedSession,
      position: 1,
      status: WaitlistStatus.CONVERTED,
      offeredAt: addDays(now, -2),
      offerExpiresAt: addDays(now, -1),
    });
  }
}

async function seedClientNote(
  prisma: PrismaClient,
  memberId: string,
  coachUserId: string,
): Promise<void> {
  await prisma.clientNote.upsert({
    where: { id: "seed-client-note-member" },
    update: { body: "Prefers morning reformer slots; sensitive lower back." },
    create: {
      id: "seed-client-note-member",
      userId: memberId,
      authorId: coachUserId,
      body: "Prefers morning reformer slots; sensitive lower back.",
    },
  });
}

type BookingSeed = {
  userId: string;
  sessionId: string;
  status: BookingStatus;
  channel: BookingChannel;
  attendedAt?: Date;
  cancelledAt?: Date;
};

async function upsertBooking(
  prisma: PrismaClient,
  seed: BookingSeed,
): Promise<{ id: string }> {
  return prisma.booking.upsert({
    where: { userId_sessionId: { userId: seed.userId, sessionId: seed.sessionId } },
    update: {
      status: seed.status,
      channel: seed.channel,
      attendedAt: seed.attendedAt ?? null,
      cancelledAt: seed.cancelledAt ?? null,
    },
    create: {
      userId: seed.userId,
      sessionId: seed.sessionId,
      status: seed.status,
      channel: seed.channel,
      attendedAt: seed.attendedAt ?? null,
      cancelledAt: seed.cancelledAt ?? null,
    },
    select: { id: true },
  });
}

type WaitlistSeed = {
  userId: string;
  sessionId: string;
  position: number;
  status: WaitlistStatus;
  offeredAt?: Date;
  offerExpiresAt?: Date;
};

async function upsertWaitlist(prisma: PrismaClient, seed: WaitlistSeed): Promise<void> {
  await prisma.waitlistEntry.upsert({
    where: { userId_sessionId: { userId: seed.userId, sessionId: seed.sessionId } },
    update: {
      position: seed.position,
      status: seed.status,
      offeredAt: seed.offeredAt ?? null,
      offerExpiresAt: seed.offerExpiresAt ?? null,
    },
    create: {
      userId: seed.userId,
      sessionId: seed.sessionId,
      position: seed.position,
      status: seed.status,
      offeredAt: seed.offeredAt ?? null,
      offerExpiresAt: seed.offerExpiresAt ?? null,
    },
  });
}
