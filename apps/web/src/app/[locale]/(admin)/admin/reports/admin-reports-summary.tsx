type Dashboard = {
  sessionsToday: number;
  bookingsToday: number;
  activeWaitlists: number;
  activeMembers: number;
  revenueCentsTotal: number;
};

type AdminReportsSummaryProps = {
  data: Dashboard;
};

export function AdminReportsSummary({ data }: AdminReportsSummaryProps) {
  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li className="rounded-[20px] border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Sessions today
        </p>
        <p className="mt-2 text-2xl font-semibold text-zinc-900">
          {data.sessionsToday}
        </p>
      </li>
      <li className="rounded-[20px] border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Bookings today
        </p>
        <p className="mt-2 text-2xl font-semibold text-zinc-900">
          {data.bookingsToday}
        </p>
      </li>
      <li className="rounded-[20px] border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Active waitlists
        </p>
        <p className="mt-2 text-2xl font-semibold text-zinc-900">
          {data.activeWaitlists}
        </p>
      </li>
      <li className="rounded-[20px] border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Active members
        </p>
        <p className="mt-2 text-2xl font-semibold text-zinc-900">
          {data.activeMembers}
        </p>
      </li>
      <li className="rounded-[20px] border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Revenue (cents recorded)
        </p>
        <p className="mt-2 text-2xl font-semibold text-zinc-900">
          {data.revenueCentsTotal}
        </p>
      </li>
    </ul>
  );
}
