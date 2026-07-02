"use client";

import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";

type AdminWaitlistLoadErrorShellProps = {
  staffBanner?: string;
  loadError: string;
  onRetry: () => void;
};

export function AdminWaitlistLoadErrorShell({
  staffBanner,
  loadError,
  onRetry,
}: AdminWaitlistLoadErrorShellProps) {
  const t = useTranslations("adminPages.waitlists");

  return (
    <StaffListPageLayout
      title={t("title")}
      banner={staffBanner}
      status={
        <div className={adminChrome.panel}>
          <p className="text-sm text-red-800">{loadError}</p>
          <button type="button" className="ommm-cta-secondary mt-3 h-9 px-4" onClick={onRetry}>
            {t("retry")}
          </button>
        </div>
      }
    >
      <span className="sr-only">{t("loadFailed")}</span>
    </StaffListPageLayout>
  );
}
