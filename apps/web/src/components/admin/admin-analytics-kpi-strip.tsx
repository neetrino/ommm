"use client";

export type AdminAnalyticsKpiItem = {
  key: string;
  label: string;
  value: string;
};

type AdminAnalyticsKpiStripProps = {
  items: readonly AdminAnalyticsKpiItem[];
};

export function AdminAnalyticsKpiStrip({ items }: AdminAnalyticsKpiStripProps) {
  if (items.length === 0) {
    return null;
  }

  const columnClass =
    items.length >= 5
      ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      : items.length === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : items.length === 3
          ? "sm:grid-cols-3"
          : "sm:grid-cols-2";

  return (
    <ul className={`grid gap-3 ${columnClass}`}>
      {items.map((item) => (
        <li
          key={item.key}
          className="rounded-[20px] border border-white/60 bg-white/55 px-3 py-2.5 shadow-[0_8px_24px_-20px_rgba(45,40,35,0.2)] backdrop-blur-md"
        >
          <p className="text-[11px] font-medium uppercase tracking-wide text-sage-500">
            {item.label}
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-sage-900">{item.value}</p>
        </li>
      ))}
    </ul>
  );
}
