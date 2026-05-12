import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type ClientRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
};

export default async function AdminClientsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.clients" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<ClientRow[]>("/clients", cookie);

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
          <code className={adminChrome.inlineCode}>GET /v1/clients</code>
          {t("descriptionTrail")}
        </>
      }
    >
      <div className={`mt-2 ${adminChrome.tableWrap}`}>
        <table className={adminChrome.table}>
          <thead className={adminChrome.thead}>
            <tr>
              <th className={adminChrome.th}>{t("colName")}</th>
              <th className={adminChrome.th}>{t("colEmail")}</th>
              <th className={adminChrome.th}>{t("colRole")}</th>
              <th className={adminChrome.th}>{t("colJoined")}</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((c) => (
              <tr key={c.id} className={adminChrome.tr}>
                <td className={adminChrome.tdStrong}>{c.name ?? "—"}</td>
                <td className={adminChrome.td}>{c.email}</td>
                <td className={adminChrome.td}>{c.role}</td>
                <td className={adminChrome.tdMuted}>
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AccountPageFrame>
  );
}
