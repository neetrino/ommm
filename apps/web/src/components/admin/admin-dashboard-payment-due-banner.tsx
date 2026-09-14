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

function PaymentDueCalmIcon() {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-mint-100 text-sage-800 ring-2 ring-white/80">
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20 7 10.5 17 5 11.5" />
      </svg>
    </span>
  );
}

function PaymentDueEmptyState({
  title,
  empty,
  countLabel,
}: {
  title: string;
  empty: string;
  countLabel: string;
}) {
  return (
    <div
      className="mb-4 flex items-center gap-4 rounded-[24px] border border-white/50 bg-white/35 px-5 py-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)] backdrop-blur-md"
      role="status"
    >
      <PaymentDueCalmIcon />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sage-500">
          {title}
        </p>
        <p className="mt-1 text-sm font-medium text-sage-800">{empty}</p>
      </div>
      <span className="hidden shrink-0 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[11px] font-semibold tabular-nums text-sage-700 sm:inline-flex">
        {countLabel}
      </span>
    </div>
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
  const hasDueItems = count > 0 && items.length > 0;

  if (!hasDueItems) {
    return (
      <PaymentDueEmptyState
        title={t("title")}
        empty={t("empty")}
        countLabel={t("count", { count: 0 })}
      />
    );
  }

  const uniqueCount = uniquePaymentDueClients(items).length;
  const canToggle = uniqueCount > DASHBOARD_PAYMENT_DUE_PREVIEW_LIMIT;
  const visibleItems = visiblePaymentDueClients(items, expanded);

  return (
    <>
      <div
        className="mb-4 rounded-[24px] border-2 border-rose-500 bg-rose-600 px-5 py-4 text-white shadow-[0_18px_40px_-18px_rgba(190,18,60,0.55)]"
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
