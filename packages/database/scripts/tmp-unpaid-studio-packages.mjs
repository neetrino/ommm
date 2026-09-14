import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const HOUR_MS = 60 * 60 * 1000;
const cutoff = new Date(Date.now() - HOUR_MS);

async function main() {
  const payments = await prisma.payment.findMany({
    where: {
      source: "PACKAGE",
      status: "PENDING",
      paymentMethod: { in: ["CASH", "CARD_TERMINAL"] },
    },
    select: {
      id: true,
      status: true,
      paymentMethod: true,
      sourceId: true,
      userId: true,
      createdAt: true,
    },
    take: 30,
    orderBy: { createdAt: "desc" },
  });
  const packageIds = payments
    .map((row) => row.sourceId)
    .filter((id) => id !== null);
  const packages =
    packageIds.length === 0
      ? []
      : await prisma.userPackage.findMany({
          where: { id: { in: packageIds } },
          select: {
            id: true,
            status: true,
            sessionsTotal: true,
            sessionsRemaining: true,
            user: {
              select: { id: true, email: true, name: true, lastName: true },
            },
          },
        });
  const consumptions =
    packageIds.length === 0
      ? []
      : await prisma.bookingConsumption.findMany({
          where: { userPackageId: { in: packageIds }, restoredAt: null },
          select: {
            userPackageId: true,
            consumedSessions: true,
            consumedGuestSlots: true,
            booking: {
              select: {
                status: true,
                attendedAt: true,
                session: { select: { endsAt: true, startsAt: true } },
              },
            },
          },
        });
  const due = consumptions.filter(
    (row) => row.booking.session.endsAt.getTime() <= cutoff.getTime(),
  );
  process.stdout.write(
    `${JSON.stringify(
      {
        now: new Date().toISOString(),
        cutoff: cutoff.toISOString(),
        unpaidCount: payments.length,
        payments: payments.map((row) => ({
          id: row.id,
          method: row.paymentMethod,
          sourceId: row.sourceId,
          userId: row.userId,
          createdAt: row.createdAt,
        })),
        packages: packages.map((pkg) => ({
          id: pkg.id,
          status: pkg.status,
          used:
            pkg.sessionsTotal !== null && pkg.sessionsRemaining !== null
              ? pkg.sessionsTotal - pkg.sessionsRemaining
              : null,
          email: pkg.user.email,
          name: [pkg.user.name, pkg.user.lastName].filter(Boolean).join(" "),
        })),
        consumptionCount: consumptions.length,
        dueAfterOneHour: due.length,
        dueRows: due.map((row) => ({
          userPackageId: row.userPackageId,
          bookingStatus: row.booking.status,
          startsAt: row.booking.session.startsAt,
          endsAt: row.booking.session.endsAt,
          hoursSinceEnd: Math.round(
            (Date.now() - row.booking.session.endsAt.getTime()) / HOUR_MS,
          ),
        })),
      },
      null,
      2,
    )}\n`,
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
