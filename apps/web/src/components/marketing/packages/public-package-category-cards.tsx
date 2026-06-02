import { getTranslations } from "next-intl/server";
import { PublicPackageCategoryCard } from "@/components/marketing/packages/public-package-category-card";
import type { PublicPackageCategoryGroup } from "@/lib/public-package-categories";

export type PublicPackageCategoryCardsAudience = "guest" | "member";

type PublicPackageCategoryCardsProps = {
  locale: string;
  categories: readonly PublicPackageCategoryGroup[];
  audience?: PublicPackageCategoryCardsAudience;
};

export async function PublicPackageCategoryCards({
  locale,
  categories,
  audience = "guest",
}: PublicPackageCategoryCardsProps) {
  const m = await getTranslations({ locale, namespace: "marketing" });

  if (categories.length === 0) {
    return (
      <p className="ommm-card p-5 text-sm text-sage-500 sm:p-6" role="status">
        {m("packagesEmpty")}
      </p>
    );
  }

  return (
    <ul className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
      {categories.map((category) => (
        <PublicPackageCategoryCard
          key={category.id}
          locale={locale}
          category={category}
          audience={audience}
        />
      ))}
    </ul>
  );
}
