import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminMembershipActions } from "@/components/admin/admin-membership-actions";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type MembershipAdminRow = {
  id: string;
  status: string;
  sessionsRemaining: number | null;
  currentPeriodEnd: string | null;
  plan: { name: string; slug: string };
  user: { id: string; email: string; name: string | null };
};

export default async function AdminMembershipsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.memberships" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MembershipAdminRow[]>(
    "/memberships/admin/all",
    cookie,
  );

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
      description={
        <>
          {t("descriptionLead")}{" "}
          <code className={adminChrome.inlineCode}>
            GET /v1/memberships/admin/all
          </code>
          {t("descriptionTrail")}
        </>
      }
    >
      <div className={`mt-2 ${adminChrome.tableWrap}`}>
        <table className={adminChrome.table}>
          <thead className={adminChrome.thead}>
            <tr>
              <th className={adminChrome.th}>{t("colMember")}</th>
              <th className={adminChrome.th}>{t("colPlan")}</th>
              <th className={adminChrome.th}>{t("colStatus")}</th>
              <th className={adminChrome.th}>{t("colSessionsLeft")}</th>
              <th className={adminChrome.th}>{t("colPeriodEnd")}</th>
              <th className={adminChrome.th}>{t("colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((m) => (
              <tr key={m.id} className={adminChrome.tr}>
                <td className={adminChrome.tdStrong}>
                  <div className="font-medium">{m.user.name ?? "—"}</div>
                  <div className={adminChrome.metaText}>{m.user.email}</div>
                </td>
                <td className={adminChrome.td}>{m.plan.name}</td>
                <td className={adminChrome.td}>{m.status}</td>
                <td className={adminChrome.td}>
                  {m.sessionsRemaining ?? "—"}
                </td>
                <td className={adminChrome.td}>
                  {m.currentPeriodEnd
                    ? new Date(m.currentPeriodEnd).toLocaleDateString()
                    : "—"}
                </td>
                <td className={adminChrome.td}>
                  <AdminMembershipActions membershipId={m.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AccountPageFrame>
  );
}
