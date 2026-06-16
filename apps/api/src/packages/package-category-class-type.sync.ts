import type { Prisma } from '@prisma/client';

const MAX_CLASS_TYPE_SLUG_LENGTH = 120;

function trimHyphenEdges(value: string): string {
  let start = 0;
  let end = value.length;

  while (start < end && value.charCodeAt(start) === 45) {
    start += 1;
  }
  while (end > start && value.charCodeAt(end - 1) === 45) {
    end -= 1;
  }

  return value.slice(start, end);
}

type ClassTypeRecord = {
  id: string;
  name: string;
  slug: string;
};

type PackageCategoryClassTypeDb = Pick<Prisma.TransactionClient, 'classType'>;

type PackageCategoryClassTypeSyncDb = Pick<
  Prisma.TransactionClient,
  'classType' | 'packagePlan'
>;

type PackageCategoryClassTypeCleanupDb = Pick<
  Prisma.TransactionClient,
  'classType' | 'classSession' | 'packagePlan'
>;

export type SyncPackageCategoryClassTypeParams = {
  categoryName: string;
  previousCategoryName?: string;
};

/** Builds the ClassType slug used for a package category label. */
export function buildClassTypeSlugFromPackageCategory(
  categoryName: string,
): string {
  const normalized = trimHyphenEdges(
    categoryName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-'),
  );
  return normalized
    .split('-')
    .filter((segment) => segment.length > 0)
    .join('-')
    .slice(0, MAX_CLASS_TYPE_SLUG_LENGTH);
}

function normalizePackageCategoryLabel(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

function categoryComparisonKey(name: string): string {
  return normalizePackageCategoryLabel(name).toLocaleLowerCase();
}

function isSingularPluralSlugPair(left: string, right: string): boolean {
  return left === `${right}s` || right === `${left}s`;
}

async function findClassTypeBySlug(
  db: PackageCategoryClassTypeDb,
  slug: string,
): Promise<ClassTypeRecord | null> {
  if (slug.length === 0) {
    return null;
  }
  return db.classType.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });
}

async function findClassTypeByName(
  db: PackageCategoryClassTypeDb,
  name: string,
): Promise<ClassTypeRecord | null> {
  const normalized = normalizePackageCategoryLabel(name);
  if (normalized.length === 0) {
    return null;
  }
  return db.classType.findFirst({
    where: { name: { equals: normalized, mode: 'insensitive' } },
    select: { id: true, name: true, slug: true },
  });
}

async function listClassTypes(
  db: PackageCategoryClassTypeDb,
): Promise<ClassTypeRecord[]> {
  return db.classType.findMany({
    select: { id: true, name: true, slug: true },
  });
}

async function findClassTypeForCategoryLabel(
  db: PackageCategoryClassTypeDb,
  label: string,
): Promise<ClassTypeRecord | null> {
  const normalizedLabel = normalizePackageCategoryLabel(label);
  if (normalizedLabel.length === 0) {
    return null;
  }

  const slug = buildClassTypeSlugFromPackageCategory(normalizedLabel);
  const bySlug = await findClassTypeBySlug(db, slug);
  if (bySlug !== null) {
    return bySlug;
  }

  const byName = await findClassTypeByName(db, normalizedLabel);
  if (byName !== null) {
    return byName;
  }

  const labelKey = categoryComparisonKey(normalizedLabel);
  const allTypes = await listClassTypes(db);
  const keyMatches = allTypes.filter(
    (row) => categoryComparisonKey(row.name) === labelKey,
  );
  if (keyMatches.length === 1) {
    return keyMatches[0];
  }

  if (slug.length === 0) {
    return null;
  }

  const slugMatches = allTypes.filter(
    (row) => row.slug === slug || isSingularPluralSlugPair(row.slug, slug),
  );
  if (slugMatches.length === 1) {
    return slugMatches[0];
  }

  return null;
}

async function updateClassTypeRecord(
  db: PackageCategoryClassTypeDb,
  id: string,
  data: { name: string; slug?: string },
): Promise<void> {
  await db.classType.update({
    where: { id },
    data,
  });
}

async function applyClassTypeCategorySync(
  db: PackageCategoryClassTypeDb,
  target: ClassTypeRecord,
  categoryName: string,
  slug: string,
): Promise<void> {
  if (target.name === categoryName && target.slug === slug) {
    return;
  }

  const slugOwner = await findClassTypeBySlug(db, slug);
  if (slugOwner !== null && slugOwner.id !== target.id) {
    if (target.name !== categoryName) {
      await updateClassTypeRecord(db, target.id, { name: categoryName });
    }
    return;
  }

  await updateClassTypeRecord(db, target.id, {
    name: categoryName,
    slug,
  });
}

/**
 * Keeps `ClassType` names aligned with package category labels when admins add or edit plans.
 */
export async function syncClassTypeForPackageCategory(
  db: PackageCategoryClassTypeDb,
  params: SyncPackageCategoryClassTypeParams,
): Promise<void> {
  const categoryName = normalizePackageCategoryLabel(params.categoryName);
  const slug = buildClassTypeSlugFromPackageCategory(categoryName);
  if (slug.length === 0) {
    return;
  }

  const previousCategoryName =
    params.previousCategoryName !== undefined
      ? normalizePackageCategoryLabel(params.previousCategoryName)
      : undefined;
  if (
    previousCategoryName !== undefined &&
    categoryComparisonKey(previousCategoryName) ===
      categoryComparisonKey(categoryName)
  ) {
    return;
  }

  const lookupLabel = previousCategoryName ?? categoryName;
  const target = await findClassTypeForCategoryLabel(db, lookupLabel);
  if (target !== null) {
    await applyClassTypeCategorySync(db, target, categoryName, slug);
    return;
  }

  await db.classType.create({
    data: {
      name: categoryName,
      slug,
    },
  });
}

/**
 * Creates missing `ClassType` rows for package category labels (including combined packages).
 */
export async function syncMissingClassTypesForPackageCategories(
  db: PackageCategoryClassTypeSyncDb,
): Promise<void> {
  const rows = await db.packagePlan.findMany({
    select: { categoryName: true },
  });
  const seenKeys = new Set<string>();
  for (const row of rows) {
    const label = normalizePackageCategoryLabel(row.categoryName);
    if (label.length === 0) {
      continue;
    }
    const key = categoryComparisonKey(label);
    if (seenKeys.has(key)) {
      continue;
    }
    seenKeys.add(key);
    await syncClassTypeForPackageCategory(db, { categoryName: label });
  }
}

/**
 * Removes orphaned `ClassType` rows when their package categories are deleted.
 * A class type is kept when another package still references that category label
 * or when class sessions are linked to the class type.
 */
export async function cleanupClassTypesForRemovedPackageCategories(
  db: PackageCategoryClassTypeCleanupDb,
  params: { removedCategoryNames: readonly string[] },
): Promise<void> {
  const removedKeys = new Set<string>();
  const removedLabelsByKey = new Map<string, string>();
  for (const rawLabel of params.removedCategoryNames) {
    const label = normalizePackageCategoryLabel(rawLabel);
    if (label.length === 0) {
      continue;
    }
    const key = categoryComparisonKey(label);
    if (removedKeys.has(key)) {
      continue;
    }
    removedKeys.add(key);
    removedLabelsByKey.set(key, label);
  }
  if (removedKeys.size === 0) {
    return;
  }

  const rows = await db.packagePlan.findMany({
    select: { categoryName: true },
  });
  const activeCategoryKeys = new Set<string>();
  for (const row of rows) {
    const label = normalizePackageCategoryLabel(row.categoryName);
    if (label.length === 0) {
      continue;
    }
    activeCategoryKeys.add(categoryComparisonKey(label));
  }

  for (const [key, label] of removedLabelsByKey.entries()) {
    if (activeCategoryKeys.has(key)) {
      continue;
    }
    const target = await findClassTypeForCategoryLabel(db, label);
    if (target === null) {
      continue;
    }
    const linkedSessions = await db.classSession.count({
      where: { classTypeId: target.id },
    });
    if (linkedSessions > 0) {
      continue;
    }
    await db.classType.delete({
      where: { id: target.id },
    });
  }
}
