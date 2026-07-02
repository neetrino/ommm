import type { AdminClientsPayload } from "@/components/admin/admin-clients-types";
import { adminChrome } from "@/components/admin/admin-chrome";

type AdminClientsSummaryProps = {
  payload: AdminClientsPayload;
};

export function AdminClientsSummary({ payload }: AdminClientsSummaryProps) {
  const cards = [
    ["Total", payload.summary.total],
    ["Active", payload.summary.active],
    ["VIP", payload.summary.vip],
    ["Visits", payload.summary.totalVisits],
  ];
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value]) => (
        <article key={label} className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{label}</p>
          <p className={adminChrome.metricValue}>{value}</p>
        </article>
      ))}
    </section>
  );
}
