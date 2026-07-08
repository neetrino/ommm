import { useMemo } from "react";
import { useTranslations } from "../../i18n/I18nProvider";

type DashboardRole = "MANAGER" | "COACH" | "ADMIN";

const SUBTITLE_ROLE_KEY: Record<DashboardRole, "manager" | "coach" | "admin"> = {
  MANAGER: "manager",
  COACH: "coach",
  ADMIN: "admin",
};

export function usePlaceholderTabCopy(role: DashboardRole, tab: string) {
  const tNav = useTranslations("dashboard.nav");
  const tSub = useTranslations("dashboard.subtitles");
  const subtitleRole = SUBTITLE_ROLE_KEY[role];

  return useMemo(
    () => ({
      title: tNav(`${role}.${tab}`),
      subtitle: tSub(`${subtitleRole}.${tab}`),
    }),
    [role, subtitleRole, tab, tNav, tSub],
  );
}
