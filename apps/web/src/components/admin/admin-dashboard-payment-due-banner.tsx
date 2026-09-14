"use client";

import { useTranslations } from "next-intl";
import { PaymentDueWarningIcon } from "@/components/admin/admin-client-package-payment-due-banner";
import {
  studioPaymentDueClientHref,
  type DashboardStudioPaymentDueItem,
} from "@/components/admin/admin-dashboard-payment-due";
import { Link } from "@/i18n/navigation";

type AdminDashboardPaymentDueBannerProps = {
  items: DashboardStudioPaymentDueItem[];
  count: number;
  clientsHref: string;
};

export function AdminDashboardPaymentDueBanner({
  items,
  count,
  clientsHref,
}: AdminDashboardPaymentDueBannerProps) {
  const t = useTranslations("adminHome.overview.paymentDue");
  if (count === 0 || items.length === 0) {
    return null;
  }

  return (
    <div
      className="mb-4 rounded-[22px] border-2 border-rose-500 bg-rose-600 px-5 py-4 text-white shadow-[0_18px_40px_-18px_rgba(190,18,60,0.55)]"
      role="status"
    >
      <div className="flex items-center gap-4">
        <PaymentDueWarningIcon />
        <div className="min-w-0 space-y-1">
          <p className="text-base font-bold uppercase tracking-[0.12em]">
            {t("title")}
          </p>
          <p className="text-sm font-medium text-rose-50">{t("hint")}</p>
          <p className="text-xs font-medium text-rose-100">{t("count", { count })}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.packageId}>
            <Link
              href={studioPaymentDueClientHref(clientsHref, item.clientId)}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/25 bg-white/15 px-3 py-2.5 text-sm font-medium text-white hover:bg-white/25"
            >
              <span className="min-w-0 truncate">
                {item.clientName}
                <span className="mt-0.5 block truncate text-xs font-normal text-rose-50">
                  {item.packageName}
                </span>
              </span>
              <span className="shrink-0 text-xs uppercase tracking-wide">
                {t("openClient", { name: item.clientName })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
