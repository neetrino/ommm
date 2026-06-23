import {
  GiftCardStatus,
  PrismaClient,
  ScheduleDayOfWeek,
} from "@prisma/client";
import { SEED_SCHEDULE_CLASS_PREFIX } from "./constants";
import type { SeededUsers } from "./seed-users";

export async function seedStudioSettings(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.studioSettings.findFirst();
  if (existing !== null) {
    await prisma.studioSettings.update({
      where: { id: existing.id },
      data: {
        studioName: "Ommm Pilates & Movement",
        contactEmail: "info@ommm.com",
        contactPhone: "+37410123456",
        whatsappUrl: "https://wa.me/37410123456",
        address: "25 Pushkin St,Yerevan",
        workingHours: "Mon–Sat 7:00–21:00 · Sun 9:00–18:00",
        socialLinksJson: JSON.stringify({
          instagram: "https://instagram.com/ommm.studio",
          facebook: "https://facebook.com/ommm.studio",
        }),
        cancellationHoursNotice: 24,
        waitlistOfferMinutes: 30,
      },
    });
    return;
  }

  await prisma.studioSettings.create({
    data: {
      studioName: "Ommm Pilates & Movement",
      contactEmail: "info@ommm.com",
      contactPhone: "+37410123456",
      whatsappUrl: "https://wa.me/37410123456",
      address: "25 Pushkin St,Yerevan",
      workingHours: "Mon–Sat 7:00–21:00 · Sun 9:00–18:00",
      socialLinksJson: JSON.stringify({
        instagram: "https://instagram.com/ommm.studio",
        facebook: "https://facebook.com/ommm.studio",
      }),
      cancellationHoursNotice: 24,
      waitlistOfferMinutes: 30,
    },
  });
}

export async function seedAchievements(prisma: PrismaClient, users: SeededUsers): Promise<void> {
  const achievements = [
    { key: "first_class", title: "First Glow", threshold: 1 },
    { key: "classes_5", title: "Five Flows", threshold: 5 },
    { key: "classes_10", title: "Ten Strong", threshold: 10 },
    { key: "classes_25", title: "Quarter Century", threshold: 25 },
  ] as const;

  for (const achievement of achievements) {
    const record = await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {
        title: achievement.title,
        description: `Complete ${achievement.threshold} studio classes`,
        threshold: achievement.threshold,
      },
      create: {
        key: achievement.key,
        title: achievement.title,
        description: `Complete ${achievement.threshold} studio classes`,
        threshold: achievement.threshold,
      },
    });

    if (achievement.key === "first_class" || achievement.key === "classes_5") {
      await prisma.userAchievement.upsert({
        where: {
          userId_achievementId: {
            userId: users.memberId,
            achievementId: record.id,
          },
        },
        update: {},
        create: { userId: users.memberId, achievementId: record.id },
      });
    }
  }
}

const SCHEDULE_ITEM_SEEDS: readonly {
  className: string;
  instructorName: string;
  classType: string;
  dayOfWeek: ScheduleDayOfWeek;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  availableSpots: number;
}[] = [
  {
    className: `${SEED_SCHEDULE_CLASS_PREFIX} Sunrise Vinyasa`,
    instructorName: "Elena Kocharyan",
    classType: "Yoga",
    dayOfWeek: ScheduleDayOfWeek.MONDAY,
    startTime: "07:00",
    endTime: "07:55",
    durationMinutes: 55,
    availableSpots: 12,
  },
  {
    className: `${SEED_SCHEDULE_CLASS_PREFIX} Reformer Pulse`,
    instructorName: "Sona Melikyan",
    classType: "Reformer Group",
    dayOfWeek: ScheduleDayOfWeek.TUESDAY,
    startTime: "09:30",
    endTime: "10:25",
    durationMinutes: 55,
    availableSpots: 8,
  },
  {
    className: `${SEED_SCHEDULE_CLASS_PREFIX} Private Sculpt`,
    instructorName: "Arman Petrosyan",
    classType: "Reformer Individual",
    dayOfWeek: ScheduleDayOfWeek.WEDNESDAY,
    startTime: "11:00",
    endTime: "11:55",
    durationMinutes: 55,
    availableSpots: 1,
  },
  {
    className: `${SEED_SCHEDULE_CLASS_PREFIX} Core Glow Mat`,
    instructorName: "Elena Kocharyan",
    classType: "Mat Pilates",
    dayOfWeek: ScheduleDayOfWeek.THURSDAY,
    startTime: "19:00",
    endTime: "19:55",
    durationMinutes: 55,
    availableSpots: 10,
  },
  {
    className: `${SEED_SCHEDULE_CLASS_PREFIX} Rhythm & Release`,
    instructorName: "Elena Kocharyan",
    classType: "Dances",
    dayOfWeek: ScheduleDayOfWeek.FRIDAY,
    startTime: "20:00",
    endTime: "20:55",
    durationMinutes: 55,
    availableSpots: 14,
  },
];

export async function seedScheduleItems(prisma: PrismaClient): Promise<void> {
  await prisma.scheduleItem.deleteMany({
    where: { className: { startsWith: SEED_SCHEDULE_CLASS_PREFIX } },
  });

  for (const item of SCHEDULE_ITEM_SEEDS) {
    await prisma.scheduleItem.create({
      data: {
        className: item.className,
        instructorName: item.instructorName,
        classType: item.classType,
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
        durationMinutes: item.durationMinutes,
        availableSpots: item.availableSpots,
        description: "Weekly recurring showcase slot for marketing schedule.",
        isActive: true,
      },
    });
  }
}

export async function seedGiftCards(prisma: PrismaClient, users: SeededUsers): Promise<void> {
  const purchaser = users.byEmail.get("member2@ommm.local");
  const recipient = users.byEmail.get("member@ommm.local");
  const admin = users.byEmail.get("admin@ommm.local");
  if (purchaser === undefined || recipient === undefined || admin === undefined) {
    throw new Error("Seed gift cards missing required users");
  }

  await prisma.giftCard.upsert({
    where: { code: "SEED-GIFT-ACTIVE-50000" },
    update: {
      amountAmd: 50_000,
      balanceAmd: 50_000,
      status: GiftCardStatus.ACTIVE,
      recipientId: recipient.id,
      message: "Move beautifully — this one is for you.",
    },
    create: {
      code: "SEED-GIFT-ACTIVE-50000",
      amountAmd: 50_000,
      balanceAmd: 50_000,
      status: GiftCardStatus.ACTIVE,
      purchaserId: purchaser.id,
      recipientId: recipient.id,
      recipientName: "Ani Hakobyan",
      recipientEmail: recipient.email,
      message: "Move beautifully — this one is for you.",
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.giftCard.upsert({
    where: { code: "SEED-GIFT-REDEEMED-30000" },
    update: {
      amountAmd: 30_000,
      balanceAmd: 0,
      status: GiftCardStatus.REDEEMED,
    },
    create: {
      code: "SEED-GIFT-REDEEMED-30000",
      amountAmd: 30_000,
      balanceAmd: 0,
      status: GiftCardStatus.REDEEMED,
      purchaserId: admin.id,
      recipientEmail: "friend@example.com",
      recipientName: "Studio Friend",
      message: "Thank you for showing up for yourself.",
    },
  });

  const batch = await prisma.giftCardBatch.upsert({
    where: { id: "seed-gift-batch-corporate" },
    update: {
      amountAmd: 20_000,
      totalQuantity: 5,
      availableQuantity: 3,
      status: GiftCardStatus.ACTIVE,
      message: "Corporate wellness bundle — spring edition.",
    },
    create: {
      id: "seed-gift-batch-corporate",
      amountAmd: 20_000,
      totalQuantity: 5,
      availableQuantity: 3,
      status: GiftCardStatus.ACTIVE,
      purchaserId: admin.id,
      recipientName: "Wellness Team",
      recipientEmail: "team@company.am",
      message: "Corporate wellness bundle — spring edition.",
    },
  });

  await prisma.giftCard.upsert({
    where: { code: "SEED-BATCH-CARD-001" },
    update: { batchId: batch.id, status: GiftCardStatus.ACTIVE },
    create: {
      code: "SEED-BATCH-CARD-001",
      batchId: batch.id,
      amountAmd: 20_000,
      balanceAmd: 20_000,
      status: GiftCardStatus.ACTIVE,
      purchaserId: admin.id,
      recipientEmail: "team@company.am",
      recipientName: "Wellness Team",
    },
  });
}

export async function seedContactMessages(prisma: PrismaClient): Promise<void> {
  const messages = [
    {
      id: "seed-contact-1",
      name: "Lucine Asatryan",
      email: "lucine.asatryan@example.com",
      phone: "+37499111222",
      subject: "Private reformer availability",
      message: "Hi! Do you have weekend private reformer slots in April?",
    },
    {
      id: "seed-contact-2",
      name: "David Harutyunyan",
      email: "david.harutyunyan@example.com",
      phone: "+37499333444",
      subject: "Gift cards",
      message: "Can I purchase a gift card bundle for our team?",
    },
  ] as const;

  for (const message of messages) {
    await prisma.contactMessage.upsert({
      where: { id: message.id },
      update: message,
      create: message,
    });
  }
}
