"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminAccordionPanel } from "@/components/admin/admin-accordion-panel";
import type { AdminClassTypeRow } from "@/components/admin/admin-class-types-modal";
import {
  AdminPackagesShell,
  PackagesAddButton,
} from "@/components/admin/admin-packages-shell";
import { AdminPackagesCategoryTable } from "@/components/admin/admin-packages-category-table";
import { AdminPillTabs } from "@/components/admin/admin-pill-tabs";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";

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
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
          <PackagesAddButton label={t("addPackageButton")} onClick={openAddModal} />
        </div>
      </div>
    ) : (
      <div className="flex flex-wrap justify-end gap-3">
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
              />
            ))}
          </div>
        )}
      </AdminPackagesShell>
    </>
  );
}

type CategoryAccordionProps = {
  classType: AdminClassTypeRow;
  isActiveCategory: boolean;
  packages: readonly AdminPackageRow[];
  locale: string;
};

function CategoryAccordion({
  classType,
  isActiveCategory,
  packages,
  locale,
}: CategoryAccordionProps) {
  const t = useTranslations("adminPages.packages");
  const [open, setOpen] = useState(isActiveCategory);

  useEffect(() => {
    if (isActiveCategory) {
      setOpen(true);
    }
  }, [isActiveCategory]);

  const body =
    isActiveCategory && packages.length > 0 ? (
      <AdminPackagesCategoryTable packages={packages} locale={locale} />
    ) : undefined;

  return (
    <AdminAccordionPanel
      title={classType.name}
      open={open}
      onOpenChange={setOpen}
      contentVariant="table"
      emptyLabel={isActiveCategory ? t("categoryEmpty") : t("selectCategoryHint")}
    >
      {body}
    </AdminAccordionPanel>
  );
}
