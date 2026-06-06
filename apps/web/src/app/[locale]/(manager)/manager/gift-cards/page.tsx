import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { ManagerGiftCardRowActions } from "@/components/manager/manager-gift-card-row-actions";
import { ManagerStaffTableShell } from "@/components/manager/manager-staff-table-shell";
import { formatAmdFromCents } from "@/lib/price-amd";
import { serverApiJson } from "@/lib/server-api";

type GiftRow = {
  id: string;
  code: string;
  amountCents: number;
  balanceCents: number;
  status: string;
  recipientEmail: string | null;
  recipientName: string | null;
  expiresAt: string | null;
  createdAt: string;
  purchaser: { email: string; name: string | null };
  recipient: { email: string; name: string | null } | null;
};

export default async function ManagerGiftCardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.giftCards" });
  const tManager = await getTranslations({ locale, namespace: "managerPages.giftCards" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<GiftRow[]>("/gift-cards/admin", cookie);

  if (!res.ok) {
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">
          {res.status === 401 || res.status === 403
            ? t("errorAuth")
            : t("errorLoad", { status: res.status })}
        </div>
      </AdminContentFrame>
    );
  }

  return (
    <AdminContentFrame>
      <AdminSectionShell banner={tManager("readOnlyHint")}>
        <ManagerStaffTableShell>
          <table className={adminChrome.table}>
            <thead className={adminChrome.thead}>
              <tr>
                <th className={adminChrome.th}>{t("colCode")}</th>
                <th className={adminChrome.th}>{t("colPurchaser")}</th>
                <th className={adminChrome.th}>{t("colRecipient")}</th>
                <th className={adminChrome.th}>{t("colBalance")}</th>
                <th className={adminChrome.th}>{t("colStatus")}</th>
                <th className={adminChrome.th}>{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className={adminChrome.tableBodyDividers}>
              {res.data.map((g) => (
                <tr key={g.id}>
                  <td className={adminChrome.tdMono}>{g.code}</td>
                  <td className={adminChrome.td}>
                    {g.purchaser.name ?? g.purchaser.email}
                  </td>
                  <td className={adminChrome.tdMuted}>
                    {g.recipientName ?? g.recipient?.name ?? g.recipientEmail ?? "—"}
                  </td>
                  <td className={adminChrome.tdMuted}>
                    {formatAmdFromCents(g.balanceCents, locale)} /{" "}
                    {formatAmdFromCents(g.amountCents, locale)}
                  </td>
                  <td className={adminChrome.tdMuted}>{g.status}</td>
                  <td className={adminChrome.td}>
                    <ManagerGiftCardRowActions giftCardId={g.id} locale={locale} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ManagerStaffTableShell>
      </AdminSectionShell>
    </AdminContentFrame>
  );
}
