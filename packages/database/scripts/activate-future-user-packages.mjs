/**
 * Activates future-dated ACTIVE user packages immediately.
 *
 * Sets currentPeriodStart = now for ACTIVE packages whose period has not
 * started yet. currentPeriodEnd stays unchanged so no one loses days.
 *
 * Usage (from packages/database):
 *   pnpm exec dotenv -e ../../.env -- pnpm exec tsx scripts/activate-future-user-packages.mjs --dry-run
 *   pnpm exec dotenv -e ../../.env -- pnpm exec tsx scripts/activate-future-user-packages.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const dryRun = process.argv.includes('--dry-run');

async function main() {
  const now = new Date();
  const affected = await prisma.userPackage.findMany({
    where: { status: 'ACTIVE', currentPeriodStart: { gt: now } },
    select: {
      id: true,
      currentPeriodStart: true,
      currentPeriodEnd: true,
      planNameSnapshot: true,
      user: { select: { email: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (!dryRun && affected.length > 0) {
    await prisma.userPackage.updateMany({
      where: { status: 'ACTIVE', currentPeriodStart: { gt: now } },
      data: { currentPeriodStart: now },
    });
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        now: now.toISOString(),
        updated: affected.length,
        packages: affected.map((row) => ({
          email: row.user.email,
          plan: row.planNameSnapshot,
          oldStart: row.currentPeriodStart.toISOString(),
          end: row.currentPeriodEnd.toISOString(),
        })),
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
