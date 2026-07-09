"use client";

import { useTranslations } from "next-intl";
import { AdminHomeSectionVisibilityRow } from "@/components/admin/admin-home-section-visibility-row";
import { adminChrome } from "@/components/admin/admin-chrome";
import type {
  HomePageSectionDefinition,
  HomePageSectionKey,
  HomePageSectionVisibility,
  HomePageSectionVisibilityGroup,
} from "@/lib/home-page-sections";

type AdminHomeSectionVisibilityGroupProps = {
  group: HomePageSectionVisibilityGroup;
  definitions: readonly HomePageSectionDefinition[];
  sections: HomePageSectionVisibility;
  disabled: boolean;
  savingKey: HomePageSectionKey | null;
  onToggle: (key: HomePageSectionKey, enabled: boolean) => void;
};

export function AdminHomeSectionVisibilityGroup({
  group,
  definitions,
  sections,
  disabled,
  savingKey,
  onToggle,
}: AdminHomeSectionVisibilityGroupProps) {
  const t = useTranslations("adminPages.settings.homeSections");

  if (definitions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="px-2 pt-3 sm:px-3">
        <h3 className={`${adminChrome.sectionTitle} text-base`}>
          {group === "homeBanner" ? t("bannerGroupTitle") : t("siteSectionGroupTitle")}
        </h3>
        <p className={`${adminChrome.metaText} mt-1 max-w-2xl leading-relaxed`}>
          {group === "homeBanner" ? t("bannerGroupDescription") : t("siteSectionGroupDescription")}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        {definitions.map((definition) => (
          <AdminHomeSectionVisibilityRow
            key={definition.key}
            sectionKey={definition.key}
            enabled={sections[definition.key]}
            disabled={disabled}
            saving={savingKey === definition.key}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}
