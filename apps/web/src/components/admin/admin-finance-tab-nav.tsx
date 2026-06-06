"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  FINANCE_SECTION_HREF,
  FINANCE_SECTION_IDS,
  type FinanceSectionId,
} from "@/components/admin/admin-finance-module";

const TAB_LABEL_KEY: Record<FinanceSectionId, string> = {
  overview: "overview",
  payments: "payments",
  members: "members",
  coaches: "coaches",
};

export function AdminFinanceTabNav() {
  const t = useTranslations("adminPages.finance.tabs");
  const pathname = usePathname();

  return (
    <nav
      role="tablist"
      aria-label={t("aria")}
      className="inline-flex max-w-full overflow-x-auto rounded-full border border-white/60 bg-white/55 p-1 shadow-sm backdrop-blur-md"
    >
      {FINANCE_SECTION_IDS.map((section) => {
        const href = FINANCE_SECTION_HREF[section];
        const active = pathname === href || pathname.endsWith(href);
        return (
          <Link
            key={section}
            href={href}
            role="tab"
            aria-selected={active}
            aria-current={active ? "page" : undefined}
            scroll={false}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-[background-color,box-shadow,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
              active
                ? "bg-sage-800 text-white shadow-sm hover:bg-sage-900 hover:shadow-md"
                : "text-sage-700 hover:bg-white/70 hover:text-sage-900 hover:shadow-sm"
            }`}
          >
            {t(TAB_LABEL_KEY[section])}
          </Link>
        );
      })}
    </nav>
  );
}
