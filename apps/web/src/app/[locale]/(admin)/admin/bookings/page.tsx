import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type BookingAdminRow = {
  id: string;
  status: string;
  user: { name: string | null; email: string };
  session: {
    startsAt: string;
    classType: { name: string };
  };
};

export default async function AdminBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.bookings" });
  const cookie = (await headers()).get("cookie") ?? "";
  const from = new Date();
  from.setDate(from.getDate() - 7);
  const to = new Date();
  to.setDate(to.getDate() + 30);
  const q = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;

  const res = await serverApiJson<BookingAdminRow[]>(
    `/bookings/admin?${q}`,
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
    <AccountPageFrame title={t("title")} description={t("description")}>
      <div className={`mt-2 ${adminChrome.tableWrap}`}>
        <table className={adminChrome.table}>
          <thead className={adminChrome.thead}>
            <tr>
              <th className={adminChrome.th}>{t("colMember")}</th>
              <th className={adminChrome.th}>{t("colClass")}</th>
              <th className={adminChrome.th}>{t("colStarts")}</th>
              <th className={adminChrome.th}>{t("colStatus")}</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((b) => (
              <tr key={b.id} className={adminChrome.tr}>
                <td className={adminChrome.tdStrong}>
                  <span className="font-medium">
                    {b.user.name ?? b.user.email}
                  </span>
                  <br />
                  <span className={adminChrome.metaText}>{b.user.email}</span>
                </td>
                <td className={adminChrome.td}>
                  {b.session.classType.name}
                </td>
                <td className={adminChrome.td}>
                  {new Date(b.session.startsAt).toLocaleString()}
                </td>
                <td className={adminChrome.td}>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AccountPageFrame>
  );
}
