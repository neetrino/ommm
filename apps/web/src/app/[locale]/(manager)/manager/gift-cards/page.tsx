import { headers } from "next/headers";
import { AdminGiftCardActions } from "@/components/admin/admin-gift-card-actions";
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

function getManagerGiftCardsLabels(locale: string) {
  if (locale === "hy") {
    return {
      authRequired: "Պահանջվում է մենեջերի մուտք։",
      loadFailed: "Չհաջողվեց բեռնել նվեր քարտերը ({status})։",
      title: "Նվեր քարտեր",
      description:
        "Դիտեք թողարկված քարտերը և մնացորդները։ Քարտերի ստեղծումն ու ապաակտիվացումը մնում է ստուդիայի ադմիններին։",
      colCode: "Կոդ",
      colPurchaser: "Գնող",
      colRecipient: "Ստացող",
      colBalance: "Մնացորդ",
      colStatus: "Կարգավիճակ",
      colActions: "Գործողություններ",
    };
  }
  if (locale === "ru") {
    return {
      authRequired: "Нужен вход менеджера.",
      loadFailed: "Не удалось загрузить подарочные карты ({status}).",
      title: "Подарочные карты",
      description:
        "Просмотр выпущенных карт и балансов. Создание и деактивация карт остаются за админами студии.",
      colCode: "Код",
      colPurchaser: "Покупатель",
      colRecipient: "Получатель",
      colBalance: "Баланс",
      colStatus: "Статус",
      colActions: "Действия",
    };
  }
  return {
    authRequired: "Manager sign-in required.",
    loadFailed: "Could not load gift cards ({status}).",
    title: "Gift cards",
    description:
      "View issued cards and balances. Creating or deactivating cards stays with studio administrators.",
    colCode: "Code",
    colPurchaser: "Purchaser",
    colRecipient: "Recipient",
    colBalance: "Balance",
    colStatus: "Status",
    colActions: "Actions",
  };
}

export default async function ManagerGiftCardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const labels = getManagerGiftCardsLabels(locale);
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<GiftRow[]>("/gift-cards/admin", cookie);

  if (!res.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {res.status === 401 || res.status === 403
          ? labels.authRequired
          : labels.loadFailed.replace("{status}", String(res.status))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">{labels.title}</h1>
      <p className="mt-2 text-sm text-zinc-600">{labels.description}</p>
      <div className="mt-6 overflow-x-auto rounded-[24px] border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">{labels.colCode}</th>
              <th className="px-4 py-3">{labels.colPurchaser}</th>
              <th className="px-4 py-3">{labels.colRecipient}</th>
              <th className="px-4 py-3">{labels.colBalance}</th>
              <th className="px-4 py-3">{labels.colStatus}</th>
              <th className="px-4 py-3">{labels.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((g) => (
              <tr key={g.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-mono text-xs text-zinc-900">
                  {g.code}
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  {g.purchaser.name ?? g.purchaser.email}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {g.recipientName ?? g.recipient?.name ?? g.recipientEmail ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {formatAmdFromCents(g.balanceCents, locale)} /{" "}
                  {formatAmdFromCents(g.amountCents, locale)}
                </td>
                <td className="px-4 py-3 text-zinc-600">{g.status}</td>
                <td className="px-4 py-3">
                  <AdminGiftCardActions
                    giftCardId={g.id}
                    allowDeactivate={false}
                    locale={locale}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
