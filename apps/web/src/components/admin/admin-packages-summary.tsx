"use client";

import { useTranslations } from "next-intl";
import { PACKAGES_SOLD_PATH } from "@/components/admin/admin-packages-sold";
import { Link } from "@/i18n/navigation";

type AdminPackagesSummaryProps = {
  totalSold: number;
};

const SOLD_CARD_LINK_CLASS = [
  "group relative block w-full max-w-[13rem] overflow-hidden rounded-[22px]",
  "border border-white/70 bg-gradient-to-b from-white/85 via-white/70 to-white/55",
  "px-4 py-3 text-center shadow-[0_12px_32px_-24px_rgba(45,40,35,0.3)] backdrop-blur-md",
  "transition-[transform,border-color,box-shadow] duration-200",
  "hover:-translate-y-0.5 hover:border-sand-300/80",
  "hover:shadow-[0_18px_40px_-24px_rgba(45,40,35,0.38)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
  "sm:px-5 sm:py-3.5",
].join(" ");

function PackagesSoldIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        d="M21 8.5 12 3 3 8.5V18a1.5 1.5 0 0 0 1.5 1.5H19.5A1.5 1.5 0 0 0 21 18V8.5Z"
        strokeLinejoin="round"
      />
      <path d="M3 8.5 12 14l9-5.5" strokeLinejoin="round" />
      <path d="M12 14v8.5" strokeLinecap="round" />
    </svg>
  );
}

function SoldCardChevron() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="absolute right-3 top-3 h-4 w-4 text-sage-400 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-sand-700"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function AdminPackagesSummary({ totalSold }: AdminPackagesSummaryProps) {
  const t = useTranslations("adminPages.packages");
  const formattedTotal = new Intl.NumberFormat().format(totalSold);

  return (
    <section className="flex justify-center px-1">
      <Link
        href={PACKAGES_SOLD_PATH}
        className={SOLD_CARD_LINK_CLASS}
        aria-label={t("sold.summaryLinkAria", { count: formattedTotal })}
      >
        <div
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-sand-300/70 to-transparent"
          aria-hidden
        />
        <SoldCardChevron />
        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-sand-200/80 bg-gradient-to-b from-sand-50 to-white text-sand-700 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.95),0_6px_16px_-12px_rgba(45,40,35,0.25)]">
          <PackagesSoldIcon />
        </div>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sage-500">
          {t("summaryTotalSold")}
        </p>
        <p className="mt-1 font-serif text-[clamp(1.5rem,3.5vw,2rem)] font-semibold leading-none tabular-nums text-sage-800">
          {formattedTotal}
        </p>
      </Link>
    </section>
  );
}
