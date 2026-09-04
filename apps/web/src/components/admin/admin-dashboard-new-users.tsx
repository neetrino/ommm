import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import {
  buildBackofficeClientProfileHref,
  type BackofficeClientsPath,
} from "@/components/admin/admin-clients-query";
import { Link } from "@/i18n/navigation";
import { formatDateTimeForUi } from "@/lib/date-display";
import { userDisplayInitials } from "@/lib/user-display-initials";

const NEW_USER_CARD_CLASS =
  "group flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-3 py-3 shadow-[0_8px_24px_-20px_rgba(45,40,35,0.22)] transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-sand-300/80 hover:bg-white hover:shadow-[0_16px_36px_-24px_rgba(45,40,35,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

const NEW_USER_AVATAR_CLASS =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand-700 text-sm font-semibold text-cream-50 ring-2 ring-white";

const NEW_USER_COUNT_BADGE_CLASS =
  "inline-flex min-w-7 items-center justify-center rounded-full bg-sand-700 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-cream-50";

export type DashboardNewUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type AdminDashboardNewUsersProps = {
  locale: string;
  todayCount: number;
  users: readonly DashboardNewUser[];
  clientsPath: BackofficeClientsPath;
};

export async function AdminDashboardNewUsers({
  locale,
  todayCount,
  users,
  clientsPath,
}: AdminDashboardNewUsersProps) {
  const tm = await getTranslations({ locale, namespace: "adminHome.overview" });

  return (
    <section className="mt-4">
      <article className={adminChrome.panel}>
        <div className="flex items-center justify-between gap-3">
          <p className={adminChrome.panelHeading}>{tm("newUsers.heading")}</p>
          <span className={NEW_USER_COUNT_BADGE_CLASS}>{todayCount}</span>
        </div>
        {users.length === 0 ? (
          <p className="mt-3 text-sm text-sage-500">{tm("newUsers.empty")}</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <li key={user.id}>
                <NewUserCard
                  user={user}
                  href={buildBackofficeClientProfileHref(clientsPath, user.id)}
                  openLabel={tm("newUsers.openAccount", { name: user.name })}
                  joinedLabel={tm("newUsers.joined", {
                    dateTime: formatDateTimeForUi(user.createdAt, locale),
                  })}
                />
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}

function NewUserCard({
  user,
  href,
  openLabel,
  joinedLabel,
}: {
  user: DashboardNewUser;
  href: string;
  openLabel: string;
  joinedLabel: string;
}) {
  return (
    <Link href={href} className={NEW_USER_CARD_CLASS} aria-label={openLabel}>
      <span className={NEW_USER_AVATAR_CLASS} aria-hidden>
        {userDisplayInitials(user.name, undefined, user.email)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-sage-900">{user.name}</span>
        <span className="mt-0.5 block truncate text-xs text-sage-500">{user.email}</span>
        <span className="mt-1.5 inline-flex rounded-full border border-sage-200/80 bg-sage-50 px-2 py-0.5 text-[11px] tabular-nums text-sage-700">
          {joinedLabel}
        </span>
      </span>
      <NewUserCardChevron />
    </Link>
  );
}

function NewUserCardChevron() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-sage-400 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-sand-700"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
