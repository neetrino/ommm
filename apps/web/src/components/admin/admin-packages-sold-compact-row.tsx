"use client";

import { useTranslations } from "next-intl";
import { formatPaymentTime, toPaymentIso } from "@/components/account/user-payment-display";
import {
  ADMIN_SOLD_PACKAGES_CLIENT_META_CLASS,
  ADMIN_SOLD_PACKAGES_CLIENT_TITLE_CLASS,
  ADMIN_SOLD_PACKAGES_LIST_CELL,
  ADMIN_SOLD_PACKAGES_LIST_DATE_CELL,
  ADMIN_SOLD_PACKAGES_LIST_ROW_CLASS,
  ADMIN_SOLD_PACKAGES_NAME_CLASS,
} from "@/components/admin/admin-packages-sold-list-layout";
import type { SoldPackageListItem } from "@/components/admin/admin-packages-sold";
import { ADMIN_FINANCE_MONEY_CLASS } from "@/components/admin/admin-finance-list-display";
import { AmdMoneyText } from "@/components/ui/amd-money-text";
import { formatDateCompactForUi } from "@/lib/date-display";
import { userDisplayName } from "@/lib/user-display-name";

type AdminPackagesSoldCompactRowProps = {
  locale: string;
  row: SoldPackageListItem;
  onOpenClient: (clientId: string) => void;
};

export function AdminPackagesSoldCompactRow({
  locale,
  row,
  onOpenClient,
}: AdminPackagesSoldCompactRowProps) {
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
      className={ADMIN_SOLD_PACKAGES_LIST_ROW_CLASS}
    >
      <div className={ADMIN_SOLD_PACKAGES_LIST_CELL}>
        <p className={ADMIN_SOLD_PACKAGES_CLIENT_TITLE_CLASS}>{clientName}</p>
        <p className={ADMIN_SOLD_PACKAGES_CLIENT_META_CLASS}>{row.user.email}</p>
      </div>
      <div className={ADMIN_SOLD_PACKAGES_LIST_CELL}>
        <p className={ADMIN_SOLD_PACKAGES_NAME_CLASS}>{row.packageName}</p>
      </div>
      <div className={ADMIN_SOLD_PACKAGES_LIST_DATE_CELL}>
        <p className="text-sm font-medium tabular-nums text-sage-800">
          {formatDateCompactForUi(paidAtIso)}
        </p>
        <p className="mt-0.5 text-xs tabular-nums text-sage-500">
          {formatPaymentTime(paidAtIso, locale)}
        </p>
      </div>
      <div className={ADMIN_SOLD_PACKAGES_LIST_CELL}>
        <AmdMoneyText cents={row.amountCents} locale={locale} className={ADMIN_FINANCE_MONEY_CLASS} />
      </div>
    </article>
  );
}
