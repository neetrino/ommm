"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminCoachFinanceTab } from "@/components/admin/admin-coach-finance-tab";
import { AdminUserFinanceTab } from "@/components/admin/admin-user-finance-tab";
import type { AdminFinanceManagementProps, FinanceTab } from "@/components/admin/admin-finance-types";

const TAB_QUERY_KEY = "tab";

function parseTab(value: string | null): FinanceTab {
  return value === "coach" ? "coach" : "user";
}

export function AdminFinanceManagement({
  locale,
  initialTab,
  initialClients,
  initialCoachFinance,
  initialPayments,
  paymentsFrom,
  paymentsStatus,
  paymentsSource,
}: AdminFinanceManagementProps) {
  const t = useTranslations("adminPages.finance");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get(TAB_QUERY_KEY) ?? initialTab);

  function setTab(next: FinanceTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "user") {
      params.delete(TAB_QUERY_KEY);
    } else {
      params.set(TAB_QUERY_KEY, next);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <section className="mt-8 space-y-4">
      <div
        role="tablist"
        aria-label={t("tabsAria")}
        className="inline-flex rounded-full border border-white/60 bg-white/55 p-1 shadow-sm backdrop-blur-md"
      >
        <TabButton active={tab === "user"} onClick={() => setTab("user")} label={t("tabUserFinance")} />
        <TabButton active={tab === "coach"} onClick={() => setTab("coach")} label={t("tabCoachFinance")} />
      </div>
      {tab === "user" ? (
        <AdminUserFinanceTab
          locale={locale}
          initialClients={initialClients}
          initialPayments={initialPayments}
          paymentsFrom={paymentsFrom}
          paymentsStatus={paymentsStatus}
          paymentsSource={paymentsSource}
        />
      ) : (
        <AdminCoachFinanceTab locale={locale} initial={initialCoachFinance} />
      )}
    </section>
  );
}

function TabButton(props: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={props.active}
      className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-[background-color,box-shadow,color,transform] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
        props.active
          ? "bg-sage-800 text-white shadow-sm hover:bg-sage-900 hover:shadow-md"
          : "text-sage-700 hover:bg-white/70 hover:text-sage-900 hover:shadow-sm"
      }`}
      onClick={props.onClick}
    >
      {props.label}
    </button>
  );
}
