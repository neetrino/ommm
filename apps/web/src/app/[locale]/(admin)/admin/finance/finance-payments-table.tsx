import { getTranslations } from "next-intl/server";
import { formatAmdFromCents } from "@/lib/price-amd";

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

type FinancePaymentsTableProps = {
  items: PaymentItem[];
  locale: string;
};

function displayUserName(name: string | null, lastName: string | null): string {
  const merged = `${name ?? ""} ${lastName ?? ""}`.trim();
  return merged.length > 0 ? merged : "—";
}

function statusBadgeClass(status: string): string {
  if (status === "SUCCEEDED") return "bg-mint-100 text-mint-900";
  if (status === "PENDING") return "bg-amber-100 text-amber-900";
  if (status === "REFUNDED") return "bg-sky-100 text-sky-900";
  if (status === "FAILED") return "bg-rose-100 text-rose-900";
  return "bg-sage-100 text-sage-700";
}

export async function FinancePaymentsTable({ items, locale }: FinancePaymentsTableProps) {
  const t = await getTranslations({ locale, namespace: "adminPages.finance.table" });

  if (items.length === 0) {
    return (
      <section className="rounded-[20px] border border-white/60 bg-white/70 p-4 text-sm text-sage-600">
        {t("empty")}
      </section>
    );
  }

  return (
    <section className="rounded-[20px] border border-white/60 bg-white/70 p-4">
      <div className="grid gap-3 md:hidden">
        {items.map((row) => (
          <article key={row.id} className="rounded-2xl border border-sage-100 bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-sage-500">
                {new Date(row.createdAt).toLocaleString(locale)}
              </p>
              <span
                className={`rounded-full px-2 py-1 text-[11px] font-medium ${statusBadgeClass(row.status)}`}
              >
                {row.status}
              </span>
            </div>
            <p className="mt-2 font-medium text-sage-900">
              {displayUserName(row.user.name, row.user.lastName)}
            </p>
            <p className="text-xs text-sage-500">{row.user.email}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-sage-600">
              <div>
                <p className="text-sage-500">{t("colAmount")}</p>
                <p className="font-medium text-sage-900">
                  {formatAmdFromCents(row.amountCents, locale)}
                </p>
              </div>
              <div>
                <p className="text-sage-500">{t("colSource")}</p>
                <p className="font-medium text-sage-900">{row.source}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-sage-500">{row.description ?? "—"}</p>
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
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
                <td className="px-4 py-3 align-top">
                  {new Date(row.createdAt).toLocaleString(locale)}
                </td>
                <td className="px-4 py-3 align-top">
                  <p className="font-medium text-sage-800">
                    {displayUserName(row.user.name, row.user.lastName)}
                  </p>
                  <p className="text-xs text-sage-500">{row.user.email}</p>
                </td>
                <td className="px-4 py-3 align-top font-medium text-sage-800">
                  {formatAmdFromCents(row.amountCents, locale)}
                </td>
                <td className="px-4 py-3 align-top">{row.source}</td>
                <td className="px-4 py-3 align-top">
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-medium ${statusBadgeClass(row.status)}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 align-top text-xs text-sage-500">
                  {row.description ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
