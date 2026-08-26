"use client";

import { useTranslations } from "next-intl";
import { MembershipPeriodHighlight } from "@/components/account/membership-period-highlight";
import {
  buildMembershipDisplayModel,
  memberStatusClassName,
} from "@/components/account/user-membership-display";
import { UserPackageLifecycleActions } from "@/components/account/user-package-lifecycle-actions";
import {
  USER_PACKAGES_LIST_ACTIONS_CELL,
  USER_PACKAGES_LIST_CELL_CLASS,
  USER_PACKAGES_LIST_PERIOD_CELL,
  USER_PACKAGES_LIST_PRICE_CELL,
  USER_PACKAGES_LIST_ROW_CLASS,
  USER_PACKAGES_LIST_SESSIONS_CELL,
  USER_PACKAGES_LIST_STATUS_CELL,
  USER_PACKAGES_LIST_VALIDITY_CELL,
} from "@/components/account/user-packages-list-layout";
import { USER_LIST_TITLE_SERIF_CLASS } from "@/components/account/user-list-table-layout";
import { AmdMoneyText } from "@/components/ui/amd-money-text";
import type { UserMembershipRow, UserPackageStatus } from "@/lib/user-package-types";

type UserMembershipCompactRowProps = {
  membership: UserMembershipRow;
  locale: string;
  status: UserPackageStatus;
  onOpenDetails: () => void;
};

export function UserMembershipCompactRow({
  membership,
  locale,
  status,
  onOpenDetails,
}: UserMembershipCompactRowProps) {
  const t = useTranslations("userPages.packages");
  const m = useTranslations("marketing");
  const display = buildMembershipDisplayModel(membership, status, t, m);

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={t("viewDetailsFor", { name: display.sessionName })}
      onClick={onOpenDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails();
        }
      }}
      className={USER_PACKAGES_LIST_ROW_CLASS}
    >
      <div className={USER_PACKAGES_LIST_CELL_CLASS}>
        <MobileLabel label={t("listHeaderPackage")} />
        <p className={USER_LIST_TITLE_SERIF_CLASS} title={display.sessionName}>
          {display.sessionName}
        </p>
        <p className="mt-1 truncate text-xs font-medium text-sage-500">
          {membership.plan.categoryName}
        </p>
      </div>

      <div className={USER_PACKAGES_LIST_PERIOD_CELL}>
        <MobileLabel label={t("listHeaderPeriod")} />
        {membership.awaitingFirstVisit === true ? (
          <p className="text-sm font-medium text-sage-800">{display.validityLabel}</p>
        ) : (
          <MembershipPeriodHighlight
            locale={locale}
            periodStart={membership.currentPeriodStart}
            periodEnd={membership.currentPeriodEnd}
            variant="list"
          />
        )}
      </div>

      <div className={USER_PACKAGES_LIST_PRICE_CELL}>
        <MobileLabel label={t("listHeaderPrice")} />
        <AmdMoneyText
          cents={membership.plan.priceCents}
          locale={locale}
          className="font-serif text-xl leading-none text-sage-950"
        />
      </div>

      <div className={USER_PACKAGES_LIST_SESSIONS_CELL}>
        <MobileLabel label={t("listHeaderSessions")} />
        <p className="truncate text-sm font-medium text-sage-800">{display.sessionsSummary}</p>
      </div>

      <div className={USER_PACKAGES_LIST_VALIDITY_CELL}>
        <MobileLabel label={t("listHeaderValidity")} />
        <p className="text-sm font-medium text-sage-800">{display.validityLabel}</p>
      </div>

      <div className={USER_PACKAGES_LIST_STATUS_CELL}>
        <MobileLabel label={t("listHeaderStatus")} />
        <span className={`inline-flex whitespace-nowrap ${memberStatusClassName(status)}`}>
          {display.statusLabel}
        </span>
      </div>

      <div
        className={USER_PACKAGES_LIST_ACTIONS_CELL}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <MobileLabel label={t("listHeaderActions")} />
        <div className="md:flex md:w-full md:flex-col md:items-center">
          <UserPackageLifecycleActions
            userPackageId={membership.id}
            status={status}
            freeze={membership.freeze}
            layout="list"
          />
        </div>
      </div>
    </article>
  );
}

function MobileLabel({ label }: { label: string }) {
  return (
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-sage-500 md:hidden">
      {label}
    </p>
  );
}
