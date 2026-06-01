"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminAccordionPanel } from "@/components/admin/admin-accordion-panel";
import { AdminClassTypesModal, type AdminClassTypeRow } from "@/components/admin/admin-class-types-modal";
import { AdminPackageActions } from "@/components/admin/admin-package-actions";
import {
  AdminPackagesShell,
  PackagesAddButton,
} from "@/components/admin/admin-packages-shell";
import { formatPackageSessionsLabel } from "@/components/admin/admin-packages-filter-logic";
import { AdminPillTabs } from "@/components/admin/admin-pill-tabs";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { formatAmdFromCents } from "@/lib/price-amd";

const MODAL_QUERY_KEY = "modal";
const MODAL_QUERY_VALUE = "add-package";

type AdminPackagesManagementProps = {
  packages: readonly AdminPackageRow[];
  classTypes: readonly AdminClassTypeRow[];
  locale: string;
};

export function AdminPackagesManagement({
  packages,
  classTypes,
  locale,
}: AdminPackagesManagementProps) {
  const t = useTranslations("adminPages.packages");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => classTypes[0]?.id ?? "");
  const [classTypesOpen, setClassTypesOpen] = useState(false);

  useEffect(() => {
    if (classTypes.length === 0) {
      return;
    }
    if (!classTypes.some((type) => type.id === activeTab)) {
      setActiveTab(classTypes[0].id);
    }
  }, [activeTab, classTypes]);

  const sortedPackages = useMemo(
    () => [...packages].sort((left, right) => left.displayOrder - right.displayOrder),
    [packages],
  );

  const pillItems = useMemo(
    () => classTypes.map((type) => ({ id: type.id, label: type.name })),
    [classTypes],
  );

  function openAddModal() {
    const params = new URLSearchParams(searchParams.toString());
    params.set(MODAL_QUERY_KEY, MODAL_QUERY_VALUE);
    router.replace(`${pathname}?${params.toString()}`);
  }

  const toolbar =
    pillItems.length > 0 ? (
      <div className="ommm-admin-packages-toolbar">
        <AdminPillTabs
          items={pillItems}
          activeId={activeTab}
          onChange={setActiveTab}
          ariaLabel={t("filters.status")}
        />
        <PackagesAddButton label={t("addPackageButton")} onClick={openAddModal} />
      </div>
    ) : (
      <div className="flex justify-end">
        <PackagesAddButton label={t("addPackageButton")} onClick={openAddModal} />
      </div>
    );

  return (
    <>
      <AdminPackagesShell toolbar={toolbar}>
        {classTypes.length === 0 ? (
          <p className="text-sm text-sage-500">{t("categoryEmpty")}</p>
        ) : (
          <div className="flex flex-col gap-5">
            {classTypes.map((classType) => (
              <CategoryAccordion
                key={classType.id}
                classType={classType}
                isActiveCategory={classType.id === activeTab}
                packages={sortedPackages}
                locale={locale}
                onEditCategory={() => setClassTypesOpen(true)}
              />
            ))}
          </div>
        )}
      </AdminPackagesShell>

      <AdminClassTypesModal
        isOpen={classTypesOpen}
        classTypes={classTypes}
        sessionCountByTypeId={{}}
        onClose={() => setClassTypesOpen(false)}
        onChanged={() => {
          setClassTypesOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}

type CategoryAccordionProps = {
  classType: AdminClassTypeRow;
  isActiveCategory: boolean;
  packages: readonly AdminPackageRow[];
  locale: string;
  onEditCategory: () => void;
};

function CategoryAccordion({
  classType,
  isActiveCategory,
  packages,
  locale,
  onEditCategory,
}: CategoryAccordionProps) {
  const t = useTranslations("adminPages.packages");

  const body =
    isActiveCategory && packages.length > 0 ? (
      <div className="flex flex-col gap-5">
        {packages.map((pkg) => (
          <AdminAccordionPanel key={pkg.id} title={pkg.name} nested>
            <PackageDetails pkg={pkg} locale={locale} />
          </AdminAccordionPanel>
        ))}
      </div>
    ) : undefined;

  return (
    <AdminAccordionPanel
      title={classType.name}
      editLabel={t("editCategory")}
      onEdit={onEditCategory}
      emptyLabel={isActiveCategory ? t("categoryEmpty") : t("selectCategoryHint")}
    >
      {body}
    </AdminAccordionPanel>
  );
}

function PackageDetails({ pkg, locale }: { pkg: AdminPackageRow; locale: string }) {
  const t = useTranslations("adminPages.packages");
  const amount = formatAmdFromCents(pkg.priceCents, locale);
  const features = pkg.features.length > 0 ? pkg.features : [];
  const sessionsLabel = formatPackageSessionsLabel(pkg, {
    unlimited: t("sessionsUnlimited"),
    sessions: (count) => t("sessionsPerMonth", { count }),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {pkg.isPopular ? (
            <span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-sand-800">
              {t("popularBadge")}
            </span>
          ) : null}
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${pkg.isActive ? "bg-mint-100 text-mint-800" : "bg-sage-100 text-sage-700"}`}
          >
            {pkg.isActive ? t("statusActive") : t("statusInactive")}
          </span>
        </div>
      </div>

      {pkg.description ? (
        <p className="break-words text-sm leading-relaxed text-sage-500">{pkg.description}</p>
      ) : null}

      <p className="font-serif text-3xl font-semibold tracking-tight text-sage-700">
        <span className="text-black">{amount.startsWith("֏") ? "֏" : ""}</span>
        {amount.startsWith("֏") ? amount.slice(1) : amount}
      </p>
      <p className="text-sm text-sage-500">
        {pkg.billingPeriod} · {pkg.periodDays} {t("daysLabel")}
      </p>
      <p className="text-sm text-sage-600">
        <span className="text-sage-500">{t("cardSessions")}: </span>
        {sessionsLabel}
      </p>

      {features.length > 0 ? (
        <ul className="space-y-2 text-sm text-sage-700">
          {features.map((feature) => (
            <li key={`${pkg.id}-${feature}`} className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-mint-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-sage-500">{t("noFeatures")}</p>
      )}

      <div className="border-t border-white/50 pt-4">
        <div className="mb-3 text-xs uppercase tracking-wide text-sage-500">
          {t("colOrder")}: {pkg.displayOrder}
        </div>
        <AdminPackageActions packageId={pkg.id} isActive={pkg.isActive} />
      </div>
    </div>
  );
}
