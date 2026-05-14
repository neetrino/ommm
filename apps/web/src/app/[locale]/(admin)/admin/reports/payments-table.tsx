import { getTranslations } from "next-intl/server";

type PaymentItem = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  description: string | null;
  source: "membership" | "dropin" | "gift" | "other";
  createdAt: string;
  user: {
    email: string;
    name: string | null;
    lastName: string | null;
  };
};

type PaymentsTableProps = {
  items: PaymentItem[];
  locale: string;
};

function formatMoney(cents: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function displayUserName(name: string | null, lastName: string | null): string {
  const merged = `${name ?? ""} ${lastName ?? ""}`.trim();
  return merged.length > 0 ? merged : "—";
}

export async function PaymentsTable({ items, locale }: PaymentsTableProps) {
  const t = await getTranslations({ locale, namespace: "adminPages.reports.table" });

  if (items.length === 0) {
    return (
      <section className="rounded-[20px] border border-white/60 bg-white/70 p-4 text-sm text-sage-600">
        {t("empty")}
      </section>
    );
  }

  return (
    <section className="overflow-x-auto rounded-[20px] border border-white/60 bg-white/70">
      <table className="min-w-full border-collapse text-sm text-sage-700">
        <thead>
          <tr className="border-b border-sage-200 bg-sage-50/80 text-left text-xs uppercase tracking-wide text-sage-500">
            <th className="px-4 py-3">{t("colDate")}</th>
            <th className="px-4 py-3">{t("colUser")}</th>
            <th className="px-4 py-3">{t("colAmount")}</th>
            <th className="px-4 py-3">{t("colSource")}</th>
            <th className="px-4 py-3">{t("colStatus")}</th>
            <th className="px-4 py-3">{t("colDescription")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id} className="border-b border-sage-100/80 last:border-b-0">
              <td className="px-4 py-3 align-top">{new Date(row.createdAt).toLocaleString(locale)}</td>
              <td className="px-4 py-3 align-top">
                <p className="font-medium text-sage-800">
                  {displayUserName(row.user.name, row.user.lastName)}
                </p>
                <p className="text-xs text-sage-500">{row.user.email}</p>
              </td>
              <td className="px-4 py-3 align-top font-medium text-sage-800">
                {formatMoney(row.amountCents, row.currency, locale)}
              </td>
              <td className="px-4 py-3 align-top">{row.source}</td>
              <td className="px-4 py-3 align-top">{row.status}</td>
              <td className="px-4 py-3 align-top text-xs text-sage-500">
                {row.description ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
