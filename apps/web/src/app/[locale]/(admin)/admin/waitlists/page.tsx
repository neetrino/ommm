import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminWaitlistActions } from "@/components/admin/admin-waitlist-actions";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type WaitlistAdminRow = {
  id: string;
  position: number;
  status: string;
  offeredAt: string | null;
  offerExpiresAt: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  session: { id: string; startsAt: string; classType: { name: string } };
};

export default async function AdminWaitlistsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.waitlists" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<WaitlistAdminRow[]>(
    "/waitlist/admin/recent?take=200",
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
      description={t("description")}
    >
      <div className={`mt-2 ${adminChrome.tableWrap}`}>
        <table className={adminChrome.table}>
          <thead className={adminChrome.thead}>
            <tr>
              <th className={adminChrome.th}>{t("colUser")}</th>
              <th className={adminChrome.th}>{t("colClass")}</th>
              <th className={adminChrome.th}>{t("colSession")}</th>
              <th className={adminChrome.th}>{t("colPos")}</th>
              <th className={adminChrome.th}>{t("colStatus")}</th>
              <th className={adminChrome.th}>{t("colOfferExpires")}</th>
              <th className={adminChrome.th}>{t("colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((w) => (
              <tr key={w.id} className={adminChrome.tr}>
                <td className={adminChrome.tdStrong}>
                  <div className="font-medium">{w.user.name ?? "—"}</div>
                  <div className={adminChrome.metaText}>{w.user.email}</div>
                </td>
                <td className={adminChrome.td}>
                  {w.session.classType.name}
                </td>
                <td className={adminChrome.td}>
                  {new Date(w.session.startsAt).toLocaleString()}
                </td>
                <td className={adminChrome.td}>{w.position}</td>
                <td className={adminChrome.td}>{w.status}</td>
                <td className={adminChrome.td}>
                  {w.offerExpiresAt
                    ? new Date(w.offerExpiresAt).toLocaleString()
                    : "—"}
                </td>
                <td className={adminChrome.td}>
                  <AdminWaitlistActions entryId={w.id} sessionId={w.session.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AccountPageFrame>
  );
}
