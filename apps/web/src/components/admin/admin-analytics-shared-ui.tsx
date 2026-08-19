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
    <div className={adminChrome.tableWrap}>
      <table className={adminChrome.table}>
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
  return (
    <div className={adminChrome.tableWrap}>
      <table className={adminChrome.table}>
        <thead className={adminChrome.thead}>
          <tr>
            <th className={adminChrome.th} scope="col">
              {labels.rank}
            </th>
            <th className={adminChrome.th} scope="col">
              {labels.name}
            </th>
            <th className={adminChrome.th} scope="col">
              {labels.count}
            </th>
            {labels.secondary ? (
              <th className={adminChrome.th} scope="col">
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
              <td className={adminChrome.td}>{row.displayValue ?? row.value}</td>
              {labels.secondary ? (
                <td className={adminChrome.td}>{row.secondaryValue ?? ""}</td>
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
