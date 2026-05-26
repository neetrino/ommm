import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminClientActions } from "@/components/admin/admin-client-actions";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { formatDateForUi } from "@/lib/date-display";
import { serverApiJson } from "@/lib/server-api";

type ClientRow = {
  id: string;
  email: string;
  name: string | null;
  lastName?: string | null;
  phone?: string | null;
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
      description={t("description")}
    >
      <div className={`mt-2 ${adminChrome.tableWrap}`}>
        <table className={`${adminChrome.table} table-fixed min-w-[28rem] sm:min-w-[32rem]`}>
          <colgroup>
            <col className="w-1/4" />
            <col className="w-1/4" />
            <col className="w-1/4" />
            <col className="w-1/4" />
          </colgroup>
          <thead className={adminChrome.thead}>
            <tr>
              <th className={adminChrome.th}>{t("colName")}</th>
              <th className={adminChrome.th}>{t("colEmail")}</th>
              <th className={adminChrome.th}>{t("colJoined")}</th>
              <th className={`${adminChrome.th} text-center`}>{t("colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((c) => (
              <tr key={c.id} className={adminChrome.tr}>
                <td className={adminChrome.tdStrong}>{c.name ?? "—"}</td>
                <td className={adminChrome.td}>{c.email}</td>
                <td className={adminChrome.tdMuted}>
                  {formatDateForUi(c.createdAt)}
                </td>
                <td className={`${adminChrome.td} text-center`}>
                  <AdminClientActions
                    clientId={c.id}
                    initialEmail={c.email}
                    initialName={c.name ?? ""}
                    initialLastName={c.lastName ?? ""}
                    initialPhone={c.phone ?? ""}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AccountPageFrame>
  );
}
