"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PaymentDueWarningIcon } from "@/components/admin/admin-client-package-payment-due-banner";
import { AdminClientDrawerById } from "@/components/admin/admin-client-drawer-by-id";
import { CLIENT_SHEET_TAB_PACKAGES } from "@/components/admin/admin-client-sheet-tabs";
import { adminChrome } from "@/components/admin/admin-chrome";
import {
  groupPaymentDueByClient,
  type DashboardStudioPaymentDueItem,
  type PaymentDueClientGroup,
} from "@/components/admin/admin-dashboard-payment-due";
import { CircularBackLink } from "@/components/ui/circular-back-link";
import { useRouter } from "@/i18n/navigation";

type AdminStudioPaymentDueViewProps = {
  items: DashboardStudioPaymentDueItem[];
  count: number;
  locale: string;
  dashboardHref: string;
  loadError: string | null;
};

function PaymentDueCalmHero({
  title,
  hint,
  countLabel,
}: {
  title: string;
  hint: string;
  countLabel: string;
}) {
  return (
    <div className={`${adminChrome.panel} mb-5 flex items-center gap-4`}>
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
      <div className="min-w-0 flex-1">
        <h1 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sage-500">
          {title}
        </h1>
        <p className="mt-1 text-sm font-medium text-sage-800">{hint}</p>
      </div>
      <span className="hidden shrink-0 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[11px] font-semibold tabular-nums text-sage-700 sm:inline-flex">
        {countLabel}
      </span>
    </div>
  );
}

function PaymentDueAlertHero({
  title,
  hint,
  countLabel,
}: {
  title: string;
  hint: string;
  countLabel: string;
}) {
  return (
    <div className="mb-5 rounded-[24px] border-2 border-rose-500 bg-rose-600 px-5 py-5 text-white shadow-[0_18px_40px_-18px_rgba(190,18,60,0.55)]">
      <div className="flex items-center gap-4">
        <PaymentDueWarningIcon />
        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="text-base font-bold uppercase tracking-[0.12em]">{title}</h1>
          <p className="text-sm font-medium text-rose-50">{hint}</p>
        </div>
        <span className="hidden shrink-0 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-semibold tabular-nums text-white sm:inline-flex">
          {countLabel}
        </span>
      </div>
    </div>
  );
}

function PaymentDuePageHero({
  title,
  hint,
  countLabel,
  hasDueItems,
}: {
  title: string;
  hint: string;
  countLabel: string;
  hasDueItems: boolean;
}) {
  if (!hasDueItems) {
    return <PaymentDueCalmHero title={title} hint={hint} countLabel={countLabel} />;
  }
  return <PaymentDueAlertHero title={title} hint={hint} countLabel={countLabel} />;
}

function PaymentDueClientCard({
  group,
  openLabel,
  openAriaLabel,
  onOpen,
}: {
  group: PaymentDueClientGroup;
  openLabel: string;
  openAriaLabel: string;
  onOpen: () => void;
}) {
  const initial = group.clientName.trim().slice(0, 1).toUpperCase() || "?";
  return (
    <li>
      <button
        type="button"
        className={`${adminChrome.panel} flex w-full items-center gap-4 text-left hover:bg-white`}
        aria-label={openAriaLabel}
        onClick={onOpen}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-50 text-sm font-semibold text-rose-700">
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-sage-900">
            {group.clientName}
          </span>
          <span className="mt-1 block space-y-0.5">
            {group.packages.map((item) => (
              <span
                key={item.packageId}
                className="block truncate text-sm text-sage-500"
              >
                {item.packageName}
              </span>
            ))}
          </span>
        </span>
        <span className="shrink-0 rounded-full border border-sage-200 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-sage-800">
          {openLabel}
        </span>
      </button>
    </li>
  );
}

export function AdminStudioPaymentDueView({
  items,
  count,
  locale,
  dashboardHref,
  loadError,
}: AdminStudioPaymentDueViewProps) {
  const t = useTranslations("adminPages.paymentDue");
  const router = useRouter();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const groups = groupPaymentDueByClient(items);
  const hasDueItems = count > 0 && items.length > 0;

  return (
    <>
      <CircularBackLink
        href={dashboardHref}
        ariaLabel={t("backToDashboard")}
        className="mb-5"
      />
      {loadError ? <p className="app-alert-warn mb-4 max-w-xl">{loadError}</p> : null}
      <PaymentDuePageHero
        title={t("title")}
        hint={hasDueItems ? t("hint") : t("empty")}
        countLabel={t("count", { count })}
        hasDueItems={hasDueItems}
      />
      {hasDueItems ? (
        <ul className="space-y-3">
          {groups.map((group) => (
            <PaymentDueClientCard
              key={group.clientId}
              group={group}
              openLabel={t("open")}
              openAriaLabel={t("openClient", { name: group.clientName })}
              onOpen={() => setSelectedClientId(group.clientId)}
            />
          ))}
        </ul>
      ) : null}
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
