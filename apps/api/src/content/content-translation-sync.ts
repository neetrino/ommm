import type { Prisma } from '@prisma/client';
import type { NormalizedContentTranslation } from './content-post.helpers';

/** Slug prefix for a translation row that staff dropped. The row stays. */
export const RETIRED_TRANSLATION_SLUG_PREFIX = 'ommm-retired-';

function retiredTranslationSlug(translationId: string): string {
  return `${RETIRED_TRANSLATION_SLUG_PREFIX}${translationId}`;
}

/** Upserts the submitted locales and frees the slug of any locale that was removed. */
export async function syncContentTranslations(
  tx: Prisma.TransactionClient,
  postId: string,
  translations: readonly NormalizedContentTranslation[],
): Promise<void> {
  for (const translation of translations) {
    await tx.contentPostTranslation.upsert({
      where: { postId_locale: { postId, locale: translation.locale } },
      create: { postId, ...translation },
      update: translation,
    });
  }
  const locales = translations.map((item) => item.locale);
  const dropped = await tx.contentPostTranslation.findMany({
    where: { postId, locale: { notIn: locales } },
    select: { id: true, slug: true },
  });
  for (const row of dropped) {
    const slug = retiredTranslationSlug(row.id);
    if (row.slug === slug) {
      continue;
    }
    await tx.contentPostTranslation.update({
      where: { id: row.id },
      data: { slug },
    });
  }
}
