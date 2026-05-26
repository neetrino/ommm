"use client";

import type { ComponentType } from "react";
import { useTranslations } from "next-intl";

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
  Icon: ComponentType<{ className?: string }>;
  iconToneClass: string;
  iconSurfaceClass: string;
  cardAccentClass: string;
};

function GridIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="3" width="8" height="8" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="13" width="8" height="8" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="13" width="8" height="8" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8.3 12.2 2.4 2.4 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M7 2.8v2.8M17 2.8v2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="3" y="4.8" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 9.2h18" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="14.4" r="2.9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 12.9v1.9l1.4.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="9" cy="9" r="2.8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16.2" cy="9.7" r="2.3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.4 18.3c.5-2.3 2.4-3.8 4.8-3.8h.5c2.5 0 4.6 1.7 4.9 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14.2 15.2h1.6c1.8 0 3.3 1.1 3.8 2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BanIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.1 15.9 15.9 8.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function FileDraftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M7 3.5h7.4L19 8.1v12.4H7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14.4 3.6v4.5H19" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.4 12.1h7.1M9.4 15.5h5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const CARDS: readonly SummaryCard[] = [
  {
    key: "total",
    Icon: GridIcon,
    iconToneClass: "text-sage-700",
    iconSurfaceClass: "bg-sage-100/85 border-sage-200/85",
    cardAccentClass: "border-sage-200/80",
  },
  {
    key: "active",
    Icon: CheckCircleIcon,
    iconToneClass: "text-mint-700",
    iconSurfaceClass: "bg-mint-100/85 border-mint-200/85",
    cardAccentClass: "border-mint-200/80",
  },
  {
    key: "upcoming",
    Icon: CalendarClockIcon,
    iconToneClass: "text-blue-700",
    iconSurfaceClass: "bg-blue-100/85 border-blue-200/85",
    cardAccentClass: "border-blue-200/80",
  },
  {
    key: "full",
    Icon: UsersIcon,
    iconToneClass: "text-amber-700",
    iconSurfaceClass: "bg-amber-100/85 border-amber-200/85",
    cardAccentClass: "border-amber-200/85",
  },
  {
    key: "cancelled",
    Icon: BanIcon,
    iconToneClass: "text-red-700",
    iconSurfaceClass: "bg-red-100/85 border-red-200/85",
    cardAccentClass: "border-red-200/85",
  },
  {
    key: "draft",
    Icon: FileDraftIcon,
    iconToneClass: "text-sage-600",
    iconSurfaceClass: "bg-sand-100/85 border-sand-200/85",
    cardAccentClass: "border-sand-200/85",
  },
] as const;

type ClassesSummaryCardProps = {
  label: string;
  value: number;
  Icon: ComponentType<{ className?: string }>;
  iconToneClass: string;
  iconSurfaceClass: string;
  cardAccentClass: string;
};

function ClassesSummaryCard({
  label,
  value,
  Icon,
  iconToneClass,
  iconSurfaceClass,
  cardAccentClass,
}: ClassesSummaryCardProps) {
  return (
    <article
      className={`group min-h-[7.5rem] rounded-[26px] border bg-white/65 p-4 shadow-[0_16px_36px_-24px_rgba(45,40,35,0.28)] backdrop-blur-md transition-transform duration-200 hover:-translate-y-0.5 sm:p-5 ${cardAccentClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-sage-500 sm:text-xs">
          {label}
        </p>
        <span
          aria-hidden
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${iconSurfaceClass} ${iconToneClass}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tabular-nums leading-none text-sage-900 sm:text-[2rem]">
        {value}
      </p>
    </article>
  );
}

export function ClassesSummaryCards(props: ClassesSummaryCardsProps) {
  const t = useTranslations("adminPages.classes");
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {CARDS.map((card) => (
        <ClassesSummaryCard
          key={card.key}
          label={t(`summary.${card.key}`)}
          value={props[card.key]}
          Icon={card.Icon}
          iconToneClass={card.iconToneClass}
          iconSurfaceClass={card.iconSurfaceClass}
          cardAccentClass={card.cardAccentClass}
        />
      ))}
    </div>
  );
}
