import { useMemo } from "react";
import { useTranslations } from "../i18n/I18nProvider";
import { tabItemsForRole, type RoleTabItem } from "./roleTabs";

export type TranslatedRoleTabItem = RoleTabItem & {
  label: string;
};

export function useRoleTabs(role: string | null): TranslatedRoleTabItem[] {
  const tDashboardNav = useTranslations("dashboard.nav");
  const tCommon = useTranslations("common");

  return useMemo(() => {
    return tabItemsForRole(role).map((item) => ({
      ...item,
      label:
        item.labelNamespace === "common"
          ? tCommon(item.labelKey)
          : tDashboardNav(item.labelKey),
    }));
  }, [role, tCommon, tDashboardNav]);
}
