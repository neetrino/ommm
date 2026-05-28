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
  memberships: Array<{
    id: string;
  }>;
};

export default async function AdminClientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    membership?: string;
    order?: string;
  }>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.clients" });
  const cookie = (await headers()).get("cookie") ?? "";
  const q = search.q?.trim() ?? "";
  const membership =
    search.membership === "active" || search.membership === "inactive"
      ? search.membership
      : "all";
  const order = search.order === "oldest" ? "oldest" : "newest";
  const apiSearch = new URLSearchParams();
  if (q.length > 0) {
    apiSearch.set("q", q);
  }
  if (membership !== "all") {
    apiSearch.set("membership", membership);
  }
  if (order !== "newest") {
    apiSearch.set("order", order);
  }
  const endpoint = apiSearch.size > 0 ? `/clients?${apiSearch.toString()}` : "/clients";
  const res = await serverApiJson<ClientRow[]>(endpoint, cookie);

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
      <form className="mt-2 grid gap-3 rounded-2xl border border-white/60 bg-white/70 p-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs text-sage-700">
          <span>{t("filters.searchLabel")}</span>
          <input
            name="q"
            defaultValue={q}
            placeholder={t("filters.searchPlaceholder")}
            className="ommm-input h-10"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-sage-700">
          <span>{t("filters.membershipLabel")}</span>
          <select name="membership" defaultValue={membership} className="ommm-input h-10">
            <option value="all">{t("filters.membershipAll")}</option>
            <option value="active">{t("filters.membershipActive")}</option>
            <option value="inactive">{t("filters.membershipInactive")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-sage-700">
          <span>{t("filters.orderLabel")}</span>
          <select name="order" defaultValue={order} className="ommm-input h-10">
            <option value="newest">{t("filters.orderNewest")}</option>
            <option value="oldest">{t("filters.orderOldest")}</option>
          </select>
        </label>
        <div className="flex items-end">
          <button type="submit" className="ommm-cta-secondary h-10 w-full">
            {t("filters.apply")}
          </button>
        </div>
      </form>
      <div className={`mt-2 ${adminChrome.tableWrap}`}>
        <table className={`${adminChrome.table} table-fixed min-w-[28rem] sm:min-w-[32rem]`}>
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[26%]" />
            <col className="w-[20%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead className={adminChrome.thead}>
            <tr>
              <th className={adminChrome.th}>{t("colName")}</th>
              <th className={adminChrome.th}>{t("colEmail")}</th>
              <th className={adminChrome.th}>{t("colJoined")}</th>
              <th className={`${adminChrome.th} text-center`}>{t("colMembership")}</th>
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
                  {c.memberships.length > 0
                    ? t("membershipActiveBadge")
                    : t("membershipInactiveBadge")}
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
