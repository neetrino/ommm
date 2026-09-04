"use client";

import { useTranslations } from "next-intl";
import { formatPaymentTime, toPaymentIso } from "@/components/account/user-payment-display";
import { ADMIN_FINANCE_MONEY_CLASS } from "@/components/admin/admin-finance-list-display";
import type { SoldPackageListItem } from "@/components/admin/admin-packages-sold";
import {
  ADMIN_SOLD_PACKAGES_BOARD_AVATAR_CLASS,
  ADMIN_SOLD_PACKAGES_BOARD_CARD_CLASS,
  ADMIN_SOLD_PACKAGES_BOARD_EYEBROW_CLASS,
  ADMIN_SOLD_PACKAGES_BOARD_META_ROW_CLASS,
  ADMIN_SOLD_PACKAGES_BOARD_PACKAGE_CLASS,
} from "@/components/admin/admin-packages-sold-list-layout";
import { AmdMoneyText } from "@/components/ui/amd-money-text";
import { formatDateCompactForUi } from "@/lib/date-display";
import { userDisplayInitials } from "@/lib/user-display-initials";
import { userDisplayName } from "@/lib/user-display-name";

type AdminPackagesSoldBoardCardProps = {
  locale: string;
  row: SoldPackageListItem;
  onOpenClient: (clientId: string) => void;
};

export function AdminPackagesSoldBoardCard({
  locale,
  row,
  onOpenClient,
}: AdminPackagesSoldBoardCardProps) {
  const t = useTranslations("adminPages.packages.sold");
  const clientName = userDisplayName(row.user.name, row.user.lastName, row.user.email);
  const paidAtIso = toPaymentIso(row.createdAt);

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={t("openClient", { name: clientName })}
      onClick={() => onOpenClient(row.user.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenClient(row.user.id);
        }
      }}
      className={ADMIN_SOLD_PACKAGES_BOARD_CARD_CLASS}
    >
      <SoldPackageCardHeader row={row} clientName={clientName} />
      <p className={ADMIN_SOLD_PACKAGES_BOARD_PACKAGE_CLASS}>{row.packageName}</p>
      <div className={ADMIN_SOLD_PACKAGES_BOARD_META_ROW_CLASS}>
        <div className="min-w-0">
          <p className={ADMIN_SOLD_PACKAGES_BOARD_EYEBROW_CLASS}>{t("columnDate")}</p>
          <p className="mt-1 text-sm font-medium tabular-nums text-sage-800">
            {formatDateCompactForUi(paidAtIso)}
            <span className="ml-1.5 text-xs text-sage-500">{formatPaymentTime(paidAtIso, locale)}</span>
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className={ADMIN_SOLD_PACKAGES_BOARD_EYEBROW_CLASS}>{t("columnAmount")}</p>
          <p className="mt-1">
            <AmdMoneyText
              cents={row.amountCents}
              locale={locale}
              className={ADMIN_FINANCE_MONEY_CLASS}
            />
          </p>
        </div>
      </div>
    </article>
  );
}

function SoldPackageCardHeader({
  row,
  clientName,
}: {
  row: SoldPackageListItem;
  clientName: string;
}) {
  const t = useTranslations("adminPages.packages.sold");

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className={ADMIN_SOLD_PACKAGES_BOARD_AVATAR_CLASS} aria-hidden>
          {userDisplayInitials(row.user.name, row.user.lastName, row.user.email)}
        </span>
        <div className="min-w-0">
          <p className={ADMIN_SOLD_PACKAGES_BOARD_EYEBROW_CLASS}>{t("columnClient")}</p>
          <p className="mt-0.5 truncate text-base font-semibold text-sage-900">{clientName}</p>
          <p className="mt-0.5 truncate text-xs text-sage-500">{row.user.email}</p>
        </div>
      </div>
      <SoldPackageCardChevron />
    </div>
  );
}

function SoldPackageCardChevron() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-1 h-4 w-4 shrink-0 text-sage-400 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-sand-700"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
