"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { resolveTrendAxisInterval } from "@/components/admin/admin-analytics-trend-data";
import { cn } from "@/lib/cn";

export type AdminAnalyticsColumnSeries = {
  key: string;
  label: string;
  color: string;
  totalLabel: string;
};

type AdminAnalyticsColumnChartProps = {
  data: Array<Record<string, string | number>>;
  xKey: string;
  series: AdminAnalyticsColumnSeries[];
  emptyLabel: string;
  ariaLabel: string;
  valueFormatter?: (value: number, seriesKey: string) => string;
  yMax?: number;
  className?: string;
  chartClassName?: string;
};

type ColumnTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: Array<{
    dataKey?: string | number;
    value?: number;
    color?: string;
    payload?: Record<string, string | number>;
  }>;
  series: AdminAnalyticsColumnSeries[];
  valueFormatter?: (value: number, seriesKey: string) => string;
};

function ColumnTooltip({ active, label, payload, series, valueFormatter }: ColumnTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const tooltipLabel =
    typeof payload[0]?.payload?.tooltipLabel === "string"
      ? payload[0].payload.tooltipLabel
      : label;

  return (
    <div className="min-w-40 rounded-lg border border-white/60 bg-white/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm">
      {tooltipLabel ? (
        <div className="mb-2 border-b border-sage-500/15 pb-1.5 font-medium text-sage-900">
          {tooltipLabel}
        </div>
      ) : null}
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

const COLUMN_BAR_MAX_SIZE = 28;

export function AdminAnalyticsColumnChart({
  data,
  xKey,
  series,
  emptyLabel,
  ariaLabel,
  valueFormatter,
  yMax,
  className,
  chartClassName,
}: AdminAnalyticsColumnChartProps) {
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
        <BarChart accessibilityLayer data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            interval={axisInterval}
            minTickGap={56}
            tick={{ fontSize: 11, fill: "var(--color-sage-500, #6b7280)" }}
          />
          <YAxis hide domain={yMax !== undefined ? [0, yMax] : [0, "auto"]} />
          <Tooltip
            cursor={{ fill: "rgba(67, 72, 67, 0.06)" }}
            content={<ColumnTooltip series={series} valueFormatter={valueFormatter} />}
          />
          {series.map((item) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              fill={`var(--color-${item.key})`}
              maxBarSize={COLUMN_BAR_MAX_SIZE}
              radius={[6, 6, 0, 0]}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
}
