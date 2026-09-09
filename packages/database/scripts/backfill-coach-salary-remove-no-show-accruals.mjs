/**
 * Fixes a payroll bug: coach salary used to accrue for a finished class as
 * long as it had any non-cancelled booking, including a no-show (MISSED).
 * The rule is now "at least one booking must be COMPLETED (attended)".
 *
 * This removes accrual rows created under the old rule where NOBODY actually
 * attended the class (every remaining booking is MISSED, or there were none
 * left after cancellations), but ONLY for coach+month periods that have not
 * already been paid out — money already paid to a coach is never clawed back
 * by this script.
 *
 * Usage (from packages/database):
 *   pnpm exec dotenv -- -e ../../.env -- pnpm exec tsx scripts/backfill-coach-salary-remove-no-show-accruals.mjs --dry-run
 *   pnpm exec dotenv -- -e ../../.env -- pnpm exec tsx scripts/backfill-coach-salary-remove-no-show-accruals.mjs
 */
import { BookingStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

function periodKey(coachProfileId, periodYear, periodMonth) {
  return `${coachProfileId}:${periodYear}-${String(periodMonth).padStart(2, "0")}`;
}

async function loadPaidPeriods() {
  const payouts = await prisma.coachSalaryPayout.findMany({
    select: { coachProfileId: true, periodYear: true, periodMonth: true },
  });
  return new Set(
    payouts.map((row) =>
      periodKey(row.coachProfileId, row.periodYear, row.periodMonth),
    ),
  );
}

async function main() {
  const paidPeriods = await loadPaidPeriods();

  const accruals = await prisma.coachSalaryAccrual.findMany({
    select: {
      id: true,
      amountAmd: true,
      coachProfileId: true,
      periodYear: true,
      periodMonth: true,
      classSession: {
        select: {
          id: true,
          startsAt: true,
          classType: { select: { name: true } },
          bookings: {
            where: { status: { not: BookingStatus.CANCELLED } },
            select: { status: true },
          },
        },
      },
    },
    orderBy: { periodYear: "asc" },
  });

  const toRemove = [];
  const skippedPaid = [];
  for (const accrual of accruals) {
    const key = periodKey(
      accrual.coachProfileId,
      accrual.periodYear,
      accrual.periodMonth,
    );
    const attended = accrual.classSession.bookings.some(
      (booking) => booking.status === BookingStatus.COMPLETED,
    );
    if (attended) {
      continue;
    }
    const row = {
      accrualId: accrual.id,
      coachProfileId: accrual.coachProfileId,
      month: `${accrual.periodYear}-${String(accrual.periodMonth).padStart(2, "0")}`,
      sessionId: accrual.classSession.id,
      startsAt: accrual.classSession.startsAt.toISOString(),
      classType: accrual.classSession.classType.name,
      amountAmd: accrual.amountAmd,
      noShowBookings: accrual.classSession.bookings.length,
    };
    if (paidPeriods.has(key)) {
      skippedPaid.push(row);
      continue;
    }
    toRemove.push(row);
  }

  if (!dryRun && toRemove.length > 0) {
    await prisma.coachSalaryAccrual.deleteMany({
      where: { id: { in: toRemove.map((row) => row.accrualId) } },
    });
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        removedCount: toRemove.length,
        removedAmountAmdTotal: toRemove.reduce(
          (sum, row) => sum + row.amountAmd,
          0,
        ),
        removed: toRemove,
        skippedAlreadyPaid: skippedPaid,
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
