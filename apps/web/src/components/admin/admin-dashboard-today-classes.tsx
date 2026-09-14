import { adminChrome } from "@/components/admin/admin-chrome";
import {
  ADMIN_SCHEDULE_STATUS_BADGE_CLASS,
  sessionStatusBadgeTone,
} from "@/components/admin/admin-schedule-session-list-badges";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";

type SessionStatus = "ACTIVE" | "CANCELLED" | "FULL" | "DRAFT" | "FINISHED";

const SESSION_STATUSES = new Set<string>([
  "ACTIVE",
  "CANCELLED",
  "FULL",
  "DRAFT",
  "FINISHED",
]);

export type DashboardTodayClassCard = {
  id: string;
  className: string;
  startsAt: string;
  coachName: string;
  bookedCount: number;
  capacity: number;
  status: string;
};

type AdminDashboardTodayClassesProps = {
  title: string;
  totalLabel: string;
  emptyLabel: string;
  dateTimeLabel: (session: DashboardTodayClassCard) => string;
  coachLabel: (session: DashboardTodayClassCard) => string;
  capacityLabel: (session: DashboardTodayClassCard) => string;
  statusLabel: (status: string) => string;
  sessions: readonly DashboardTodayClassCard[];
};

function resolveSessionStatus(status: string): SessionStatus {
  return SESSION_STATUSES.has(status) ? (status as SessionStatus) : "DRAFT";
}

const TODAY_CLASS_CARD_CLASS = [
  "relative flex min-w-0 flex-col gap-2 overflow-hidden rounded-2xl",
  "border border-white/70 bg-white/80 px-3.5 py-3",
  "shadow-[0_8px_24px_-20px_rgba(45,40,35,0.22)]",
].join(" ");

const TODAY_CLASS_META_ICON_CLASS = "h-3.5 w-3.5 shrink-0 text-mint-600";

/** Responsive card grid for today's upcoming classes on the admin dashboard. */
export function AdminDashboardTodayClasses({
  title,
  totalLabel,
  emptyLabel,
  dateTimeLabel,
  coachLabel,
  capacityLabel,
  statusLabel,
  sessions,
}: AdminDashboardTodayClassesProps) {
  return (
    <section className="mt-4">
      <article className={adminChrome.panel}>
        <div className="flex items-center justify-between gap-2">
          <p className={adminChrome.panelHeading}>{title}</p>
          <span className={adminChrome.metaText}>{totalLabel}</span>
        </div>
        {sessions.length === 0 ? (
          <p className="mt-3 text-sm text-sage-500">{emptyLabel}</p>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sessions.map((session) => {
              const status = resolveSessionStatus(session.status);
              return (
                <li key={session.id} className={TODAY_CLASS_CARD_CLASS}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 flex-1 font-semibold leading-snug text-sage-900">
                      {session.className}
                    </p>
                    <span
                      className={`shrink-0 ${ADMIN_SCHEDULE_STATUS_BADGE_CLASS} ${sessionStatusBadgeTone(status)}`}
                    >
                      {statusLabel(status)}
                    </span>
                  </div>
                  <div className="space-y-0.5 text-xs leading-relaxed text-sage-500">
                    <p className="flex min-w-0 items-center gap-1.5">
                      <DashboardNavIcon name="calendar" className={TODAY_CLASS_META_ICON_CLASS} />
                      <span className="min-w-0 truncate">{dateTimeLabel(session)}</span>
                    </p>
                    <p className="flex min-w-0 items-center gap-1.5">
                      <DashboardNavIcon name="user" className={TODAY_CLASS_META_ICON_CLASS} />
                      <span className="min-w-0 truncate">{coachLabel(session)}</span>
                    </p>
                  </div>
                  <p className="flex min-w-0 items-center gap-1.5 text-xs font-medium tabular-nums text-sage-700">
                    <DashboardNavIcon name="users" className={TODAY_CLASS_META_ICON_CLASS} />
                    <span className="min-w-0 truncate">{capacityLabel(session)}</span>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </article>
    </section>
  );
}
