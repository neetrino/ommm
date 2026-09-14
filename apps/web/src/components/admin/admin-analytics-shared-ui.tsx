"use client";

import type { ReactNode } from "react";
import { adminChrome } from "@/components/admin/admin-chrome";
import type { AnalyticsBarItem } from "@/components/admin/admin-analytics-types";

export function AnalyticsMetricTable({
  rows,
  labels,
}: {
  rows: Array<{ label: string; value: string }>;
  labels: { metric: string; value: string };
}) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
      <table className="w-full border-collapse text-left text-sm">
        <thead className={adminChrome.thead}>
          <tr>
            <th className={adminChrome.th} scope="col">
              {labels.metric}
            </th>
            <th className={adminChrome.th} scope="col">
              {labels.value}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className={adminChrome.tr}>
              <td className={adminChrome.td}>{row.label}</td>
              <td className={adminChrome.tdStrong}>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type AnalyticsRankRow = AnalyticsBarItem & {
  secondaryValue?: string;
};

export function AnalyticsRankTable({
  rows,
  labels,
}: {
  rows: AnalyticsRankRow[];
  labels: { rank: string; name: string; count: string; secondary?: string };
}) {
  const columnCount = labels.secondary ? 4 : 3;
  const tableMinWidthClass = columnCount >= 4 ? "min-w-[40rem]" : "min-w-[28rem]";

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
      <table className={`w-full ${tableMinWidthClass} border-collapse text-left text-sm`}>
        <thead className={adminChrome.thead}>
          <tr>
            <th className={adminChrome.th} scope="col">
              {labels.rank}
            </th>
            <th className={adminChrome.th} scope="col">
              {labels.name}
            </th>
            <th className={`${adminChrome.th} whitespace-nowrap`} scope="col">
              {labels.count}
            </th>
            {labels.secondary ? (
              <th className={`${adminChrome.th} whitespace-nowrap`} scope="col">
                {labels.secondary}
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.key} className={adminChrome.tr}>
              <td className={adminChrome.tdMuted}>{index + 1}</td>
              <td className={adminChrome.tdStrong}>{row.label}</td>
              <td className={`${adminChrome.td} whitespace-nowrap tabular-nums`}>
                {row.displayValue ?? row.value}
              </td>
              {labels.secondary ? (
                <td className={`${adminChrome.td} whitespace-nowrap tabular-nums`}>
                  {row.secondaryValue ?? ""}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AnalyticsSectionShell({
  title,
  hint,
  unsupported,
  children,
}: {
  title: string;
  hint?: string;
  unsupported?: string;
  children?: ReactNode;
}) {
  return (
    <section>
      <h2 className={adminChrome.sectionTitle}>{title}</h2>
      {hint ? <p className={adminChrome.metaText}>{hint}</p> : null}
      {unsupported ? (
        <p className="mt-2 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
          {unsupported}
        </p>
      ) : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </section>
  );
}
