import { CallTaskStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_COMMENT_PREFIX = "[Seed call]";
const STUDIO_OFFSET_MINUTES = -240;

function studioDateAtMidnight(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  const utcMs =
    Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1, 0, 0) +
    STUDIO_OFFSET_MINUTES * 60_000;
  return new Date(utcMs);
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function addDaysIso(isoDate: string, deltaDays: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const next = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, (day ?? 1) + deltaDays));
  return `${next.getUTCFullYear()}-${pad2(next.getUTCMonth() + 1)}-${pad2(next.getUTCDate())}`;
}

async function main(): Promise<void> {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (!admin) {
    throw new Error("No ADMIN user found; cannot seed call tasks.");
  }

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Yerevan",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  await prisma.callTask.deleteMany({
    where: { comment: { startsWith: SEED_COMMENT_PREFIX } },
  });

  await prisma.callTask.createMany({
    data: [
      {
        contactName: "Nare Petrosyan",
        phone: "+374 91 111 111",
        comment: `${SEED_COMMENT_PREFIX} Confirm trial class for next week.`,
        dueOn: studioDateAtMidnight(addDaysIso(today, -1)),
        status: CallTaskStatus.PENDING,
        createdById: admin.id,
      },
      {
        contactName: "Armine Hakobyan",
        phone: "+374 93 222 222",
        comment: `${SEED_COMMENT_PREFIX} Follow up on paused package.`,
        dueOn: studioDateAtMidnight(today),
        status: CallTaskStatus.PENDING,
        createdById: admin.id,
      },
      {
        contactName: "Gor Melikyan",
        phone: "+374 94 333 333",
        comment: `${SEED_COMMENT_PREFIX} Ask if she wants a private reformer session.`,
        dueOn: studioDateAtMidnight(today),
        status: CallTaskStatus.PENDING,
        createdById: admin.id,
      },
      {
        contactName: "Lilit Sargsyan",
        phone: "+374 95 444 444",
        comment: `${SEED_COMMENT_PREFIX} Birthday offer reminder.`,
        dueOn: studioDateAtMidnight(addDaysIso(today, 3)),
        status: CallTaskStatus.PENDING,
        createdById: admin.id,
      },
      {
        contactName: "Tigran Avetisyan",
        phone: "+374 96 555 555",
        comment: `${SEED_COMMENT_PREFIX} Called — will visit on Friday.`,
        dueOn: studioDateAtMidnight(addDaysIso(today, -2)),
        status: CallTaskStatus.DONE,
        completedAt: new Date(),
        createdById: admin.id,
      },
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
