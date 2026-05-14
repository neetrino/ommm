import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminCoachActions } from "@/components/admin/admin-coach-actions";
import { AdminCoachesShell } from "@/components/admin/admin-coaches-shell";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type CoachAdminRow = {
  id: string;
  bio: string | null;
  specialization: string | null;
  age: number | null;
  user: {
    name: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
};

function coachDisplayName(u: CoachAdminRow["user"]): string {
  const s = [u.name, u.lastName].filter(Boolean).join(" ").trim();
  return s.length > 0 ? s : "—";
}

export default async function AdminCoachesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.coaches" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<CoachAdminRow[]>("/coaches/admin/list", cookie);

  if (!res.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {res.status === 401 || res.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: res.status })}
      </div>
    );
  }

  return (
    <AccountPageFrame
      title={t("title")}
      description={t("description")}
    >
      <Suspense fallback={null}>
        <AdminCoachesShell>
          <div className={`${adminChrome.tableWrap}`}>
            <table className={`${adminChrome.table} table-fixed min-w-[34rem]`}>
              <colgroup>
                <col className="w-[24%]" />
                <col className="w-[26%]" />
                <col className="w-[18%]" />
                <col className="w-[20%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead className={adminChrome.thead}>
                <tr>
                  <th className={adminChrome.th}>{t("colName")}</th>
                  <th className={adminChrome.th}>{t("colEmail")}</th>
                  <th className={`${adminChrome.th} text-center`}>{t("colPhone")}</th>
                  <th className={`${adminChrome.th} text-center`}>{t("colSpecialization")}</th>
                  <th className={`${adminChrome.th} text-center`}>{t("colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {res.data.map((c) => (
                  <tr key={c.id} className={adminChrome.tr}>
                    <td className={adminChrome.tdStrong}>
                      {coachDisplayName(c.user)}
                    </td>
                    <td className={adminChrome.td}>{c.user.email}</td>
                    <td className={`${adminChrome.td} text-center`}>{c.user.phone ?? "—"}</td>
                    <td className={`${adminChrome.td} text-center`}>
                      {c.specialization ?? "—"}
                    </td>
                    <td className={`${adminChrome.td} text-center`}>
                      <AdminCoachActions
                        coachId={c.id}
                        initialEmail={c.user.email}
                        initialName={c.user.name ?? ""}
                        initialLastName={c.user.lastName ?? ""}
                        initialPhone={c.user.phone ?? ""}
                        initialAge={c.age}
                        initialSpecialization={c.specialization ?? ""}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCoachesShell>
      </Suspense>
    </AccountPageFrame>
  );
}
