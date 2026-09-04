"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminClientDrawerById } from "@/components/admin/admin-client-drawer-by-id";
import { useRouter } from "@/i18n/navigation";
import { formatDateTimeForUi } from "@/lib/date-display";
import { userDisplayInitials } from "@/lib/user-display-initials";

const NEW_USER_CARD_CLASS =
  "group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-3 py-3 text-left shadow-[0_8px_24px_-20px_rgba(45,40,35,0.22)] transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-sand-300/80 hover:bg-white hover:shadow-[0_16px_36px_-24px_rgba(45,40,35,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

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
};

export function AdminDashboardNewUsers({
  locale,
  todayCount,
  users,
}: AdminDashboardNewUsersProps) {
  const t = useTranslations("adminHome.overview");
  const router = useRouter();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  return (
    <section className="mt-4">
      <article className={adminChrome.panel}>
        <div className="flex items-center justify-between gap-3">
          <p className={adminChrome.panelHeading}>{t("newUsers.heading")}</p>
          <span className={NEW_USER_COUNT_BADGE_CLASS}>{todayCount}</span>
        </div>
        {users.length === 0 ? (
          <p className="mt-3 text-sm text-sage-500">{t("newUsers.empty")}</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <li key={user.id}>
                <NewUserCard
                  user={user}
                  openLabel={t("newUsers.openAccount", { name: user.name })}
                  joinedLabel={t("newUsers.joined", {
                    dateTime: formatDateTimeForUi(user.createdAt, locale),
                  })}
                  onOpen={() => setSelectedClientId(user.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </article>
      <AdminClientDrawerById
        clientId={selectedClientId}
        locale={locale}
        onClose={() => setSelectedClientId(null)}
        onChanged={() => router.refresh()}
      />
    </section>
  );
}

function NewUserCard({
  user,
  openLabel,
  joinedLabel,
  onOpen,
}: {
  user: DashboardNewUser;
  openLabel: string;
  joinedLabel: string;
  onOpen: () => void;
}) {
  return (
    <button type="button" className={NEW_USER_CARD_CLASS} aria-label={openLabel} onClick={onOpen}>
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
    </button>
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
