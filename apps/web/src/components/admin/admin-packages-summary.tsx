"use client";

import { useTranslations } from "next-intl";

type AdminPackagesSummaryProps = {
  totalSold: number;
};

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

export function AdminPackagesSummary({ totalSold }: AdminPackagesSummaryProps) {
  const t = useTranslations("adminPages.packages");
  const formattedTotal = new Intl.NumberFormat().format(totalSold);

  return (
    <section className="flex justify-center px-1" aria-label={t("summaryTotalSold")}>
      <article className="relative w-full max-w-[13rem] overflow-hidden rounded-[22px] border border-white/70 bg-gradient-to-b from-white/85 via-white/70 to-white/55 px-4 py-3 text-center shadow-[0_12px_32px_-24px_rgba(45,40,35,0.3)] backdrop-blur-md sm:px-5 sm:py-3.5">
        <div
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-sand-300/70 to-transparent"
          aria-hidden
        />
        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-sand-200/80 bg-gradient-to-b from-sand-50 to-white text-sand-700 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.95),0_6px_16px_-12px_rgba(45,40,35,0.25)]">
          <PackagesSoldIcon />
        </div>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sage-500">
          {t("summaryTotalSold")}
        </p>
        <p className="mt-1 font-serif text-[clamp(1.5rem,3.5vw,2rem)] font-semibold leading-none tabular-nums text-sage-800">
          {formattedTotal}
        </p>
      </article>
    </section>
  );
}
