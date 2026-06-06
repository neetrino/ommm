"use client";

import { useTranslations } from "next-intl";
import { useAdminStickyHeaderOffset } from "@/components/shell/use-admin-sticky-header-offset";
import { AdminFinanceTabNav } from "@/components/admin/admin-finance-tab-nav";

export function AdminFinanceLayoutHeader() {
  const t = useTranslations("adminPages.finance");
  const headerRef = useAdminStickyHeaderOffset(true);

  return (
    <header
      ref={headerRef}
      className="sticky z-20 -mx-4 mb-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      style={{ top: "var(--ommm-marketing-site-header-offset, 4.25rem)" }}
    >
      <div className="ommm-admin-header-bar flex-col items-stretch gap-3">
        <h1 className="ommm-admin-header-title">{t("title")}</h1>
        <AdminFinanceTabNav />
      </div>
    </header>
  );
}
