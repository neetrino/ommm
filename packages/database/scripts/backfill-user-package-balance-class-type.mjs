/**
 * Backfills UserPackageBalance.classTypeId from coverageKey / name.
 *
 * Usage (from packages/database):
 *   pnpm exec dotenv -e ../../.env -- pnpm exec tsx scripts/backfill-user-package-balance-class-type.mjs --dry-run
 *   pnpm exec dotenv -e ../../.env -- pnpm exec tsx scripts/backfill-user-package-balance-class-type.mjs
 *
 * Optional remap for deleted/replaced class types:
 *   CLASS_TYPE_ID_REMAP='{"oldId":"newId"}'
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const dryRun =
  process.argv.includes('--dry-run') ||
  process.env.BACKFILL_DRY_RUN === '1' ||
  process.env.BACKFILL_DRY_RUN === 'true';

function extractClassTypeIdFromCoverageKey(coverageKey) {
  const parts = coverageKey.split(':');
  return parts.length >= 3 ? (parts[2] ?? null) : null;
}

function parseRemap() {
  const raw = process.env.CLASS_TYPE_ID_REMAP?.trim();
  if (!raw) {
    return new Map();
  }
  const parsed = JSON.parse(raw);
  return new Map(Object.entries(parsed));
}

async function main() {
  const remap = parseRemap();
  const [balances, classTypes] = await Promise.all([
    prisma.userPackageBalance.findMany({
      where: { classTypeId: null },
      select: {
        id: true,
        coverageKey: true,
        sourceCategoryNameSnapshot: true,
        sourcePlanId: true,
      },
    }),
    prisma.classType.findMany({ select: { id: true, name: true } }),
  ]);

  const classTypeById = new Map(classTypes.map((row) => [row.id, row]));
  const classTypeByName = new Map(
    classTypes.map((row) => [row.name.trim().toLowerCase(), row]),
  );

  const summary = {
    dryRun,
    scanned: balances.length,
    updated: 0,
    alreadyHadId: 0,
    fromCoverageKey: 0,
    fromRemap: 0,
    fromName: 0,
    fromPlan: 0,
    unmapped: 0,
    unmappedSamples: [],
  };

  for (const balance of balances) {
    let resolvedId = extractClassTypeIdFromCoverageKey(balance.coverageKey);
    let source = 'coverageKey';

    if (resolvedId && remap.has(resolvedId)) {
      resolvedId = remap.get(resolvedId);
      source = 'remap';
    }

    if (resolvedId && !classTypeById.has(resolvedId)) {
      resolvedId = null;
    }

    if (!resolvedId) {
      const byName = classTypeByName.get(
        balance.sourceCategoryNameSnapshot.trim().toLowerCase(),
      );
      if (byName) {
        resolvedId = byName.id;
        source = 'name';
      }
    }

    if (!resolvedId && balance.sourcePlanId) {
      const plan = await prisma.packagePlan.findUnique({
        where: { id: balance.sourcePlanId },
        select: { classTypeId: true },
      });
      if (plan?.classTypeId && classTypeById.has(plan.classTypeId)) {
        resolvedId = plan.classTypeId;
        source = 'plan';
      }
    }

    if (!resolvedId) {
      summary.unmapped += 1;
      if (summary.unmappedSamples.length < 10) {
        summary.unmappedSamples.push({
          id: balance.id,
          coverageKey: balance.coverageKey,
          snapshot: balance.sourceCategoryNameSnapshot,
        });
      }
      continue;
    }

    if (!dryRun) {
      await prisma.userPackageBalance.update({
        where: { id: balance.id },
        data: { classTypeId: resolvedId },
      });
    }
    summary.updated += 1;
    if (source === 'coverageKey') summary.fromCoverageKey += 1;
    if (source === 'remap') summary.fromRemap += 1;
    if (source === 'name') summary.fromName += 1;
    if (source === 'plan') summary.fromPlan += 1;
  }

  console.log(JSON.stringify(summary, null, 2));
  if (summary.unmapped > 0) {
    process.exitCode = 2;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
