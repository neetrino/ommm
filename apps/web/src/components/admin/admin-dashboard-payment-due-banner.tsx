"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PaymentDueWarningIcon } from "@/components/admin/admin-client-package-payment-due-banner";
import { AdminClientDrawerById } from "@/components/admin/admin-client-drawer-by-id";
import { CLIENT_SHEET_TAB_PACKAGES } from "@/components/admin/admin-client-sheet-tabs";
import {
  DASHBOARD_PAYMENT_DUE_PREVIEW_LIMIT,
  uniquePaymentDueClients,
  visiblePaymentDueClients,
  type DashboardStudioPaymentDueItem,
} from "@/components/admin/admin-dashboard-payment-due";
import { useRouter } from "@/i18n/navigation";

type AdminDashboardPaymentDueBannerProps = {
  items: DashboardStudioPaymentDueItem[];
  count: number;
  locale: string;
};

type PaymentDueClientRowProps = {
  item: DashboardStudioPaymentDueItem;
  openLabel: string;
  onOpen: () => void;
};

function PaymentDueClientRow({ item, openLabel, onOpen }: PaymentDueClientRowProps) {
  return (
    <li>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/25 bg-white/15 px-3 py-2.5 text-left text-sm font-medium text-white hover:bg-white/25"
        aria-label={openLabel}
        onClick={onOpen}
      >
        <span className="min-w-0 truncate">
          {item.clientName}
          <span className="mt-0.5 block truncate text-xs font-normal text-rose-50">
            {item.packageName}
          </span>
        </span>
        <span className="shrink-0 text-xs uppercase tracking-wide">{openLabel}</span>
      </button>
    </li>
  );
}

type PaymentDueToggleButtonProps = {
  expanded: boolean;
  viewAllLabel: string;
  showLessLabel: string;
  onToggle: () => void;
};

function PaymentDueToggleButton({
  expanded,
  viewAllLabel,
  showLessLabel,
  onToggle,
}: PaymentDueToggleButtonProps) {
  return (
    <button
      type="button"
      className="mt-3 w-full rounded-2xl border border-white/30 bg-white/15 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-white/25"
      aria-expanded={expanded}
      onClick={onToggle}
    >
      {expanded ? showLessLabel : viewAllLabel}
    </button>
  );
}

export function AdminDashboardPaymentDueBanner({
  items,
  count,
  locale,
}: AdminDashboardPaymentDueBannerProps) {
  const t = useTranslations("adminHome.overview.paymentDue");
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  if (count === 0 || items.length === 0) {
    return null;
  }

  const uniqueCount = uniquePaymentDueClients(items).length;
  const canToggle = uniqueCount > DASHBOARD_PAYMENT_DUE_PREVIEW_LIMIT;
  const visibleItems = visiblePaymentDueClients(items, expanded);

  return (
    <>
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
          {visibleItems.map((item) => (
            <PaymentDueClientRow
              key={item.clientId}
              item={item}
              openLabel={t("openClient", { name: item.clientName })}
              onOpen={() => setSelectedClientId(item.clientId)}
            />
          ))}
        </ul>
        {canToggle ? (
          <PaymentDueToggleButton
            expanded={expanded}
            viewAllLabel={t("viewAll")}
            showLessLabel={t("showLess")}
            onToggle={() => setExpanded((current) => !current)}
          />
        ) : null}
      </div>
      <AdminClientDrawerById
        clientId={selectedClientId}
        locale={locale}
        initialTab={CLIENT_SHEET_TAB_PACKAGES}
        onClose={() => setSelectedClientId(null)}
        onChanged={() => router.refresh()}
      />
    </>
  );
}
