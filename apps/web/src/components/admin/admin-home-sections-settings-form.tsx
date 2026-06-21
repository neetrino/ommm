"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AdminHomeSectionVisibilityRow } from "@/components/admin/admin-home-section-visibility-row";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminCenterToast, type AdminCenterToastTone } from "@/components/ui/admin-center-toast";
import { ApiError, apiFetch } from "@/lib/api";
import { revalidatePublicStudio } from "@/lib/revalidate-public-studio";
import {
  HOME_PAGE_SECTION_DEFINITIONS,
  HOME_PAGE_SECTION_KEYS,
  type HomePageSectionKey,
  type HomePageSectionVisibility,
} from "@/lib/home-page-sections";

type AdminHomeSectionsSettingsFormProps = {
  initial: HomePageSectionVisibility;
};

type ToastState = { message: string; tone: AdminCenterToastTone } | null;

export function AdminHomeSectionsSettingsForm({
  initial,
}: AdminHomeSectionsSettingsFormProps) {
  const t = useTranslations("adminPages.settings.homeSections");
  const router = useRouter();
  const saveInFlightRef = useRef(false);
  const [sections, setSections] = useState<HomePageSectionVisibility>(initial);
  const [savingKey, setSavingKey] = useState<HomePageSectionKey | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const enabledCount = useMemo(
    () => HOME_PAGE_SECTION_KEYS.filter((key) => sections[key]).length,
    [sections],
  );

  const isBusy = savingKey !== null;

  async function persistSection(
    key: HomePageSectionKey,
    enabled: boolean,
    previous: HomePageSectionVisibility,
  ): Promise<void> {
    if (saveInFlightRef.current) {
      return;
    }

    const nextSections: HomePageSectionVisibility = { ...previous, [key]: enabled };
    saveInFlightRef.current = true;
    setSavingKey(key);
    setSections(nextSections);
    setToast(null);

    try {
      await apiFetch("/studio/home-sections", {
        method: "PATCH",
        body: JSON.stringify({ sections: nextSections }),
      });
      await revalidatePublicStudio();
      setToast({ message: t("saved"), tone: "ok" });
      router.refresh();
    } catch (error) {
      setSections(previous);
      setToast({
        message: error instanceof ApiError ? error.message : t("failed"),
        tone: "err",
      });
    } finally {
      saveInFlightRef.current = false;
      setSavingKey(null);
    }
  }

  function setSectionEnabled(key: HomePageSectionKey, enabled: boolean): void {
    if (isBusy || sections[key] === enabled) {
      return;
    }

    void persistSection(key, enabled, sections);
  }

  return (
    <>
      <div className="flex flex-col gap-6" aria-busy={isBusy}>
        <header className="max-w-3xl">
          <h2 className={adminChrome.sectionTitle}>{t("panelTitle")}</h2>
        </header>

        <section className={`${adminChrome.panel} p-0 sm:p-0`}>
          <div className="border-b border-white/50 px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex justify-center">
              <div className={`${adminChrome.metricCard} w-full max-w-md text-center`}>
                <p className={adminChrome.metricLabel}>{t("summaryLabel")}</p>
                <p className={`${adminChrome.metricValue} text-xl`}>
                  {t("summary", {
                    count: enabledCount,
                    total: HOME_PAGE_SECTION_KEYS.length,
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 px-2 pb-3 pt-1 sm:px-3 sm:pb-4 sm:pt-2">
            {HOME_PAGE_SECTION_DEFINITIONS.map((definition) => (
              <AdminHomeSectionVisibilityRow
                key={definition.key}
                sectionKey={definition.key}
                enabled={sections[definition.key]}
                disabled={isBusy}
                saving={savingKey === definition.key}
                onToggle={setSectionEnabled}
              />
            ))}
          </div>
        </section>
      </div>

      {toast ? (
        <AdminCenterToast
          message={toast.message}
          tone={toast.tone}
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </>
  );
}
