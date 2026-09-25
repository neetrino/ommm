"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PaymentDueWarningIcon } from "@/components/admin/admin-client-package-payment-due-banner";
import { AdminClientDrawerById } from "@/components/admin/admin-client-drawer-by-id";
import { CLIENT_SHEET_TAB_PACKAGES } from "@/components/admin/admin-client-sheet-tabs";
import {
  formatPaymentDuePurchaseLabel,
  previewPaymentDueGroups,
  type DashboardStudioPaymentDueItem,
  type PaymentDueClientGroup,
} from "@/components/admin/admin-dashboard-payment-due";
import { Link, useRouter } from "@/i18n/navigation";

type AdminDashboardPaymentDueBannerProps = {
  items: DashboardStudioPaymentDueItem[];
  count: number;
  locale: string;
  viewAllHref: string;
};

type PaymentDueClientCardProps = {
  group: PaymentDueClientGroup;
  boughtLabel: string;
  openLabel: string;
  onOpen: () => void;
};

function PaymentDueClientCard({
  group,
  boughtLabel,
  openLabel,
  onOpen,
}: PaymentDueClientCardProps) {
  const initial = group.clientName.trim().slice(0, 1).toUpperCase() || "?";

  return (
    <li className="min-w-0">
      <button
        type="button"
        className="flex h-full w-full flex-col rounded-[22px] border border-white/80 bg-gradient-to-b from-white to-rose-50/90 p-3.5 text-left shadow-[0_16px_32px_-20px_rgba(136,19,55,0.55)] ring-1 ring-white/70 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_36px_-18px_rgba(136,19,55,0.62)]"
        aria-label={openLabel}
        onClick={onOpen}
      >
        <span className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            {initial}
          </span>
          <span className="min-w-0 break-words font-serif text-base leading-tight text-sage-900">
            {group.clientName}
          </span>
        </span>
        <span className="mt-3.5 border-t border-rose-100/90 pt-3">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-500">
            {boughtLabel}
          </span>
          <span className="mt-1.5 flex flex-col gap-1.5">
            {group.packages.map((item) => (
              <span
                key={item.packageId}
                className="block break-words rounded-xl bg-white/90 px-2.5 py-1.5 text-xs font-medium leading-snug text-rose-950 ring-1 ring-rose-100"
              >
                {formatPaymentDuePurchaseLabel(item.categoryName, item.packageName)}
              </span>
            ))}
          </span>
        </span>
      </button>
    </li>
  );
}

function PaymentDueViewAllLink({
  href,
  label,
  tone,
}: {
  href: string;
  label: string;
  tone: "alert" | "calm";
}) {
  const className =
    tone === "alert"
      ? "inline-flex shrink-0 items-center self-center rounded-full border border-white/35 bg-white/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-white/25"
      : "inline-flex shrink-0 items-center self-center rounded-full border border-sage-200/80 bg-white/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-sage-800 hover:bg-white";

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
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

function PaymentDueFilledBanner({
  items,
  count,
  viewAllHref,
  onOpenClient,
}: {
  items: DashboardStudioPaymentDueItem[];
  count: number;
  viewAllHref: string;
  onOpenClient: (clientId: string) => void;
}) {
  const t = useTranslations("adminHome.overview.paymentDue");
  const visibleGroups = previewPaymentDueGroups(items);

  return (
    <div
      className="mb-4 rounded-[24px] border-2 border-rose-500 bg-rose-600 px-5 py-4 text-white shadow-[0_18px_40px_-18px_rgba(190,18,60,0.55)]"
      role="status"
    >
      <div className="flex items-center gap-4">
        <PaymentDueWarningIcon />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="text-base font-bold uppercase tracking-[0.12em]">
                {t("title")}
              </p>
              <p className="text-sm font-medium text-rose-50">{t("hint")}</p>
              <p className="text-xs font-medium text-rose-100">{t("count", { count })}</p>
            </div>
            <PaymentDueViewAllLink href={viewAllHref} label={t("viewAll")} tone="alert" />
          </div>
        </div>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {visibleGroups.map((group) => (
          <PaymentDueClientCard
            key={group.clientId}
            group={group}
            boughtLabel={t("bought")}
            openLabel={t("openClient", { name: group.clientName })}
            onOpen={() => onOpenClient(group.clientId)}
          />
        ))}
      </ul>
    </div>
  );
}

function PaymentDueEmptyState({
  title,
  empty,
  countLabel,
  viewAllHref,
  viewAllLabel,
}: {
  title: string;
  empty: string;
  countLabel: string;
  viewAllHref: string;
  viewAllLabel: string;
}) {
  return (
    <div
      className="mb-4 rounded-[24px] border border-white/50 bg-white/35 px-5 py-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)] backdrop-blur-md"
      role="status"
    >
      <div className="flex items-center gap-4">
        <PaymentDueCalmIcon />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sage-500">
                {title}
              </p>
              <p className="mt-1 text-sm font-medium text-sage-800">{empty}</p>
            </div>
            <PaymentDueViewAllLink href={viewAllHref} label={viewAllLabel} tone="calm" />
          </div>
        </div>
        <span className="hidden shrink-0 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[11px] font-semibold tabular-nums text-sage-700 sm:inline-flex">
          {countLabel}
        </span>
      </div>
    </div>
  );
}

export function AdminDashboardPaymentDueBanner({
  items,
  count,
  locale,
  viewAllHref,
}: AdminDashboardPaymentDueBannerProps) {
  const t = useTranslations("adminHome.overview.paymentDue");
  const router = useRouter();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const hasDueItems = count > 0 && items.length > 0;

  if (!hasDueItems) {
    return (
      <PaymentDueEmptyState
        title={t("title")}
        empty={t("empty")}
        countLabel={t("count", { count: 0 })}
        viewAllHref={viewAllHref}
        viewAllLabel={t("viewAll")}
      />
    );
  }

  return (
    <>
      <PaymentDueFilledBanner
        items={items}
        count={count}
        viewAllHref={viewAllHref}
        onOpenClient={setSelectedClientId}
      />
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
