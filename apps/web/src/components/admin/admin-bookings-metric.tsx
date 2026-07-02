type AdminBookingsMetricProps = {
  title: string;
  value: number;
};

export function AdminBookingsMetric({ title, value }: AdminBookingsMetricProps) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-sage-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-sage-900">{value}</p>
    </div>
  );
}
