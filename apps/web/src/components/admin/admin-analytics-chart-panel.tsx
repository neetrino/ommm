"use client";

import type { ReactNode } from "react";

type AdminAnalyticsChartPanelProps = {
  title: string;
  hint?: string;
  unsupported?: string;
  titleAction?: ReactNode;
  children?: ReactNode;
};

export function AdminAnalyticsChartPanel({
  title,
  hint,
  unsupported,
  titleAction,
  children,
}: AdminAnalyticsChartPanelProps) {
  return (
    <section className="rounded-[24px] border border-white/60 bg-white/55 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-sage-900">{title}</h2>
          {hint ? <p className="mt-1 text-xs text-sage-500">{hint}</p> : null}
        </div>
        {titleAction ? <div className="shrink-0 pt-0.5">{titleAction}</div> : null}
      </div>
      {unsupported ? (
        <p className="mt-2 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
          {unsupported}
        </p>
      ) : (
        <div className="mt-4">{children}</div>
      )}
    </section>
  );
}
