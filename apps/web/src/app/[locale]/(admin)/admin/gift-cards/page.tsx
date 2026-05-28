import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminCreateGiftCardForm } from "@/components/admin/admin-create-gift-card-form";
import { AdminGiftCardActions } from "@/components/admin/admin-gift-card-actions";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
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

function getGiftCardFormLabels(locale: string) {
  if (locale === "hy") {
    return {
      placeholders: {
        amount: "Գումար (ցենտ, AMD)",
        recipientEmail: "Ստացողի էլ. փոստ",
        recipientName: "Ստացողի անուն",
        message: "Հաղորդագրություն",
      },
      actions: {
        creating: "Ստեղծվում է...",
        create: "Ստեղծել",
      },
      feedback: {
        created: "Նվեր քարտը ստեղծվեց",
        failed: "Ստեղծումը չհաջողվեց",
      },
    };
  }
  if (locale === "ru") {
    return {
      placeholders: {
        amount: "Сумма (центы, AMD)",
        recipientEmail: "Email получателя",
        recipientName: "Имя получателя",
        message: "Сообщение",
      },
      actions: {
        creating: "Создание...",
        create: "Создать",
      },
      feedback: {
        created: "Подарочная карта создана",
        failed: "Не удалось создать",
      },
    };
  }
  return {
    placeholders: {
      amount: "Amount (cents, AMD)",
      recipientEmail: "Recipient email",
      recipientName: "Recipient name",
      message: "Message",
    },
    actions: {
      creating: "Creating...",
      create: "Create",
    },
    feedback: {
      created: "Gift card created",
      failed: "Creation failed",
    },
  };
}

export default async function AdminGiftCardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.giftCards" });
  const formLabels = getGiftCardFormLabels(locale);
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<GiftRow[]>("/gift-cards/admin", cookie);

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
              <th className={adminChrome.th}>{t("colCode")}</th>
              <th className={adminChrome.th}>{t("colPurchaser")}</th>
              <th className={adminChrome.th}>{t("colRecipient")}</th>
              <th className={adminChrome.th}>{t("colBalance")}</th>
              <th className={adminChrome.th}>{t("colStatus")}</th>
              <th className={adminChrome.th}>{t("colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((g) => (
              <tr key={g.id} className={adminChrome.tr}>
                <td className={adminChrome.tdMono}>{g.code}</td>
                <td className={adminChrome.td}>
                  {g.purchaser.name ?? g.purchaser.email}
                </td>
                <td className={adminChrome.td}>
                  {g.recipientName ?? g.recipient?.name ?? g.recipientEmail ?? "—"}
                </td>
                <td className={adminChrome.td}>
                  {formatAmdFromCents(g.balanceCents, locale)} /{" "}
                  {formatAmdFromCents(g.amountCents, locale)}
                </td>
                <td className={adminChrome.td}>{g.status}</td>
                <td className={adminChrome.td}>
                  <AdminGiftCardActions
                    giftCardId={g.id}
                    allowDeactivate
                    locale={locale}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className={`mt-6 ${adminChrome.panel}`}>
        <p className={adminChrome.panelHeading}>{t("createHeading")}</p>
        <AdminCreateGiftCardForm labels={formLabels} />
      </section>
    </AccountPageFrame>
  );
}
