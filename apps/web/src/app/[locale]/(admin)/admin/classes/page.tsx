import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { ACCOUNT_SESSION_RANGE_DAYS } from "@/lib/account-constants";
import { AdminClassesManagement } from "@/components/admin/admin-classes-management";
import {
  AccountPageFrame,
} from "@/components/layout/account-page-frame";
import type {
  AdminClassCoachOption,
  AdminClassSessionRow,
  AdminClassTypeOption,
} from "@/components/admin/admin-classes-types";
import { serverApiJson } from "@/lib/server-api";

type CoachAdminRow = {
  id: string;
  specialization: string | null;
  user: {
    name: string | null;
    lastName: string | null;
  };
};

export default async function AdminClassesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.classes" });
  const cookie = (await headers()).get("cookie") ?? "";
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + ACCOUNT_SESSION_RANGE_DAYS);
  const q = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;

  const [typesRes, sessionsRes, coachesRes] = await Promise.all([
    serverApiJson<AdminClassTypeOption[]>("/classes/types", cookie),
    serverApiJson<AdminClassSessionRow[]>(`/classes/admin/sessions?${q}`, cookie),
    serverApiJson<CoachAdminRow[]>("/coaches/admin/list", cookie),
  ]);

  if (!typesRes.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {typesRes.status === 401 || typesRes.status === 403
          ? t("errorTypesAuth")
          : t("errorTypesLoad", { status: typesRes.status })}
      </div>
    );
  }

  if (!sessionsRes.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {sessionsRes.status === 401 || sessionsRes.status === 403
          ? t("errorSessionsAuth")
          : t("errorSessionsLoad", { status: sessionsRes.status })}
      </div>
    );
  }

  if (!coachesRes.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {coachesRes.status === 401 || coachesRes.status === 403
          ? t("errorCoachesAuth")
          : t("errorCoachesLoad", { status: coachesRes.status })}
      </div>
    );
  }

  const coaches: AdminClassCoachOption[] = coachesRes.data.map((coach) => ({
    id: coach.id,
    name: [coach.user.name, coach.user.lastName].filter(Boolean).join(" ").trim() || t("coachFallback"),
    specialization: coach.specialization,
  }));

  return (
    <AccountPageFrame
      title={t("title")}
      description={t("description", { days: ACCOUNT_SESSION_RANGE_DAYS })}
    >
      <AdminClassesManagement
        locale={locale}
        initialSessions={sessionsRes.data}
        classTypes={typesRes.data}
        coaches={coaches}
      />
    </AccountPageFrame>
  );
}
