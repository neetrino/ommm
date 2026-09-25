"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PaymentDueWarningIcon } from "@/components/admin/admin-client-package-payment-due-banner";
import { AdminClientDrawerById } from "@/components/admin/admin-client-drawer-by-id";
import { CLIENT_SHEET_TAB_PACKAGES } from "@/components/admin/admin-client-sheet-tabs";
import {
  previewPaymentDueGroups,
  remainingPaymentDuePeopleCount,
  type DashboardStudioPaymentDueItem,
} from "@/components/admin/admin-dashboard-payment-due";
import { PaymentDueClientCard } from "@/components/admin/admin-payment-due-client-card";
import { Link, useRouter } from "@/i18n/navigation";

type AdminDashboardPaymentDueBannerProps = {
  items: DashboardStudioPaymentDueItem[];
  count: number;
  locale: string;
  viewAllHref: string;
};

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

function PaymentDueHeaderActions({
  href,
  items,
}: {
  href: string;
  items: DashboardStudioPaymentDueItem[];
}) {
  const t = useTranslations("adminHome.overview.paymentDue");
  const morePeople = remainingPaymentDuePeopleCount(items);

  return (
    <div className="flex shrink-0 items-center gap-2 self-center">
      {morePeople > 0 ? (
        <span className="inline-flex items-center rounded-full bg-white px-3 py-2 text-xs font-semibold tabular-nums text-rose-700">
          {t("morePeople", { count: morePeople })}
        </span>
      ) : null}
      <PaymentDueViewAllLink href={href} label={t("viewAll")} tone="alert" />
    </div>
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
            <PaymentDueHeaderActions href={viewAllHref} items={items} />
          </div>
        </div>
      </div>
      <ul className="mt-4 grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {visibleGroups.map((group) => (
          <PaymentDueClientCard
            key={group.clientId}
            group={group}
            boughtLabel={t("bought")}
            moreCountLabel={(extra) => t("morePackages", { count: extra })}
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
