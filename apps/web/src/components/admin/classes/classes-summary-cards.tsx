"use client";

import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";

type ClassesSummaryCardsProps = {
  total: number;
  active: number;
  upcoming: number;
  full: number;
  cancelled: number;
  draft: number;
};

type SummaryCard = {
  key: keyof ClassesSummaryCardsProps;
  icon: string;
  tone: string;
};

const CARDS: readonly SummaryCard[] = [
  { key: "total", icon: "◷", tone: "text-sage-700" },
  { key: "active", icon: "●", tone: "text-mint-700" },
  { key: "upcoming", icon: "↗", tone: "text-blue-700" },
  { key: "full", icon: "◼", tone: "text-amber-700" },
  { key: "cancelled", icon: "×", tone: "text-red-700" },
  { key: "draft", icon: "◌", tone: "text-sage-600" },
] as const;

export function ClassesSummaryCards(props: ClassesSummaryCardsProps) {
  const t = useTranslations("adminPages.classes");
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {CARDS.map((card) => (
        <article key={card.key} className={`${adminChrome.metricCard} min-h-[6.25rem]`}>
          <div className="flex items-center justify-between">
            <p className={adminChrome.metricLabel}>{t(`summary.${card.key}`)}</p>
            <span aria-hidden className={`text-sm ${card.tone}`}>
              {card.icon}
            </span>
          </div>
          <p className={`${adminChrome.metricValue} mt-3`}>{props[card.key]}</p>
        </article>
      ))}
    </div>
  );
}
