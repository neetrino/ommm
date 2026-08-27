import { adminChrome } from "@/components/admin/admin-chrome";

type AdminBookingsMetricProps = {
  title: string;
  value: number;
};

export function AdminBookingsMetric({ title, value }: AdminBookingsMetricProps) {
  return (
    <article className={adminChrome.metricCard}>
      <p className={adminChrome.metricLabel}>{title}</p>
      <p className={adminChrome.metricValue}>{value}</p>
    </article>
  );
}
