"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";
import { resolveTrendAxisInterval } from "@/components/admin/admin-analytics-trend-data";
import { cn } from "@/lib/cn";

export type AdminAnalyticsAreaSeries = {
  key: string;
  label: string;
  color: string;
  totalLabel: string;
};

type AdminAnalyticsAreaChartProps = {
  data: Array<Record<string, string | number>>;
  xKey: string;
  series: AdminAnalyticsAreaSeries[];
  emptyLabel: string;
  ariaLabel: string;
  valueFormatter?: (value: number, seriesKey: string) => string;
  className?: string;
  chartClassName?: string;
};

type TrendTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: Array<{ dataKey?: string | number; value?: number; color?: string }>;
  series: AdminAnalyticsAreaSeries[];
  valueFormatter?: (value: number, seriesKey: string) => string;
};

function TrendTooltip({ active, label, payload, series, valueFormatter }: TrendTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="min-w-40 rounded-lg border border-white/60 bg-white/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm">
      {label ? <div className="mb-2 border-b border-sage-500/15 pb-1.5 font-medium text-sage-900">{label}</div> : null}
      <div className="space-y-1.5">
        {series.map((item) => {
          const point = payload.find((entry) => entry.dataKey === item.key);
          const value = point?.value ?? 0;
          const formatted = valueFormatter?.(value, item.key) ?? value.toLocaleString();
          return (
            <div key={item.key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-sm" style={{ backgroundColor: item.color }} aria-hidden />
                <span className="text-sage-500">{item.label}</span>
              </div>
              <span className="font-mono font-medium tabular-nums text-sage-900">{formatted}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdminAnalyticsAreaChart({
  data,
  xKey,
  series,
  emptyLabel,
  ariaLabel,
  valueFormatter,
  className,
  chartClassName,
}: AdminAnalyticsAreaChartProps) {
  const chartConfig = useMemo(
    () =>
      series.reduce<ChartConfig>((acc, item) => {
        acc[item.key] = { label: item.label, color: item.color };
        return acc;
      }, {}),
    [series],
  );

  const axisInterval = resolveTrendAxisInterval(data.length);
  const hasData = data.some((point) => series.some((item) => Number(point[item.key]) > 0));

  if (!hasData) {
    return <p className="py-10 text-center text-sm text-sage-500">{emptyLabel}</p>;
  }

  return (
    <div className={cn("w-full", className)} role="img" aria-label={ariaLabel}>
      <div className="mb-4 flex flex-wrap gap-x-6 gap-y-3">
        {series.map((item) => (
          <div key={item.key} className="flex items-center gap-2.5">
            <span
              className="size-2.5 shrink-0 rounded-full border-2 bg-white"
              style={{ borderColor: item.color }}
              aria-hidden
            />
            <span className="text-sm text-sage-500">{item.label}</span>
            <span className="text-lg font-semibold leading-none text-sage-900">{item.totalLabel}</span>
          </div>
        ))}
      </div>

      <ChartContainer
        config={chartConfig}
        className={cn("aspect-auto h-[280px] w-full sm:h-[320px]", chartClassName)}
      >
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <defs>
            {series.map((item) => (
              <linearGradient key={item.key} id={`fill-${item.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`var(--color-${item.key})`} stopOpacity={0.35} />
                <stop offset="95%" stopColor={`var(--color-${item.key})`} stopOpacity={0.04} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            interval={axisInterval}
            tick={{ fontSize: 12 }}
          />
          <YAxis hide domain={[0, "auto"]} />
          <Tooltip
            cursor={{ strokeDasharray: "4 4", strokeOpacity: 0.35 }}
            content={<TrendTooltip series={series} valueFormatter={valueFormatter} />}
          />
          {series.map((item) => (
            <Area
              key={item.key}
              dataKey={item.key}
              type="natural"
              fill={`url(#fill-${item.key})`}
              fillOpacity={1}
              stroke={`var(--color-${item.key})`}
              strokeWidth={2}
              dot={{ r: 3, fill: `var(--color-${item.key})`, stroke: "#fff", strokeWidth: 1.5 }}
              activeDot={{ r: 4, stroke: "#fff", strokeWidth: 1.5 }}
            />
          ))}
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
