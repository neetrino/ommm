"use client";

import { useTranslations } from "next-intl";
import { homeSectionDashboardIcon } from "@/components/admin/admin-home-section-icons";
import { adminChrome } from "@/components/admin/admin-chrome";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import { AnimatedToggleSwitch } from "@/components/ui/animated-toggle-switch";
import type { HomePageSectionKey } from "@/lib/home-page-sections";

type AdminHomeSectionVisibilityRowProps = {
  sectionKey: HomePageSectionKey;
  enabled: boolean;
  disabled: boolean;
  saving: boolean;
  onToggle: (key: HomePageSectionKey, enabled: boolean) => void;
};

function marketingNavKeyForSection(
  key: HomePageSectionKey,
): "home" | "story" | "schedule" | "memberships" | "coaches" | "explore" | "contact" {
  return key;
}

export function AdminHomeSectionVisibilityRow({
  sectionKey,
  enabled,
  disabled,
  saving,
  onToggle,
}: AdminHomeSectionVisibilityRowProps) {
  const t = useTranslations("adminPages.settings.homeSections");
  const tNav = useTranslations("nav");
  const sectionLabel = tNav(marketingNavKeyForSection(sectionKey));

  return (
    <div
      className="group rounded-2xl border border-transparent px-2 py-3 transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-white/70 hover:bg-white/45 hover:shadow-[0_10px_28px_-22px_rgba(45,40,35,0.2)] sm:px-3 sm:py-3.5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/60 bg-white/70 text-sage-600 shadow-[0_8px_20px_-16px_rgba(45,40,35,0.25)] transition-[transform,background-color] duration-200 group-hover:scale-[1.03] group-hover:bg-white/90"
            aria-hidden
          >
            <DashboardNavIcon
              name={homeSectionDashboardIcon(sectionKey)}
              className="h-4 w-4 shrink-0"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-medium text-sage-900">{sectionLabel}</p>
            <p className={`${adminChrome.metaText} mt-1 max-w-2xl leading-relaxed`}>
              {t(`sections.${sectionKey}.description`)}
            </p>
          </div>
        </div>

        <div className="flex items-center pl-[3.25rem] sm:shrink-0 sm:justify-end sm:pl-0">
          <button
            type="button"
            className="inline-flex shrink-0 cursor-pointer items-center rounded-full p-1 transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t("toggleAria", {
              section: sectionLabel,
              state: enabled ? t("stateEnabled") : t("stateDisabled"),
            })}
            aria-pressed={enabled}
            aria-busy={saving}
            disabled={disabled}
            onClick={() => onToggle(sectionKey, !enabled)}
          >
            <AnimatedToggleSwitch
              checked={enabled}
              className={`ommm-toggle-switch-board transition-opacity duration-200 ${saving ? "opacity-70" : ""}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
