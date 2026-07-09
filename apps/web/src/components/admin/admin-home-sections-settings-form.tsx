"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminHomeSectionVisibilityRow } from "@/components/admin/admin-home-section-visibility-row";
import { AdminHomeSectionsStatusNotice } from "@/components/admin/admin-home-sections-status-notice";
import {
  HOME_SECTIONS_VIEW_QUERY_KEY,
  parseHomeSectionsViewQuery,
  resolveHomeSectionPendingToggle,
} from "@/components/admin/admin-home-sections-query";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminCenterToast, type AdminCenterToastTone } from "@/components/ui/admin-center-toast";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { ApiError, apiFetch } from "@/lib/api";
import { revalidatePublicStudio } from "@/lib/revalidate-public-studio";
import {
  HOME_PAGE_SECTION_DEFINITIONS,
  HOME_PAGE_SECTION_KEYS,
  normalizeHomePageSectionVisibility,
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
  const tNav = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsStringRef = useRef(searchParams.toString());
  const saveInFlightRef = useRef(false);
  const [sections, setSections] = useState<HomePageSectionVisibility>(() =>
    normalizeHomePageSectionVisibility(initial),
  );
  const [savingKey, setSavingKey] = useState<HomePageSectionKey | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    searchParamsStringRef.current = searchParams.toString();
  }, [searchParams]);

  const viewSectionKey = parseHomeSectionsViewQuery(
    searchParams.get(HOME_SECTIONS_VIEW_QUERY_KEY),
  );
  const pendingToggle =
    viewSectionKey === null ? null : resolveHomeSectionPendingToggle(viewSectionKey, sections);

  const replaceSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParamsStringRef.current);
      mutator(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const enabledCount = useMemo(
    () => HOME_PAGE_SECTION_KEYS.filter((key) => sections[key]).length,
    [sections],
  );

  const isBusy = savingKey !== null;

  async function persistSection(
    key: HomePageSectionKey,
    enabled: boolean,
    previous: HomePageSectionVisibility,
  ): Promise<boolean> {
    if (saveInFlightRef.current) {
      return false;
    }

    const nextSections: HomePageSectionVisibility = {
      ...normalizeHomePageSectionVisibility(previous),
      [key]: enabled,
    };
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
      return true;
    } catch (error) {
      setSections(previous);
      setToast({
        message: error instanceof ApiError ? error.message : t("failed"),
        tone: "err",
      });
      return false;
    } finally {
      saveInFlightRef.current = false;
      setSavingKey(null);
    }
  }

  function requestSectionToggle(key: HomePageSectionKey, enabled: boolean): void {
    if (isBusy || sections[key] === enabled) {
      return;
    }

    replaceSearchParams((params) => {
      params.set(HOME_SECTIONS_VIEW_QUERY_KEY, key);
    });
  }

  function closeConfirm(): void {
    if (isBusy) {
      return;
    }

    replaceSearchParams((params) => {
      params.delete(HOME_SECTIONS_VIEW_QUERY_KEY);
    });
  }

  async function confirmSectionToggle(): Promise<void> {
    if (pendingToggle === null || isBusy) {
      return;
    }

    const { key, enabled } = pendingToggle;
    const saved = await persistSection(key, enabled, sections);
    if (saved) {
      closeConfirm();
    }
  }

  const pendingSectionLabel =
    pendingToggle === null ? "" : tNav(pendingToggle.key);
  const confirmCopy =
    pendingToggle?.enabled === false
      ? {
          title: t("confirmDisableTitle", { section: pendingSectionLabel }),
          description: t("confirmDisableDescription", { section: pendingSectionLabel }),
          confirmLabel: t("disableSectionButton"),
          tone: "danger" as const,
          confirmClassName: "ommm-btn-lifecycle-action--danger",
        }
      : {
          title: t("confirmEnableTitle", { section: pendingSectionLabel }),
          description: t("confirmEnableDescription", { section: pendingSectionLabel }),
          confirmLabel: t("enableSectionButton"),
          tone: "success" as const,
          confirmClassName: "ommm-btn-lifecycle-action--success",
        };

  return (
    <>
      <div className="flex flex-col gap-6" aria-busy={isBusy}>
        <header className="max-w-3xl">
          <h2 className={adminChrome.sectionTitle}>{t("panelTitle")}</h2>
        </header>

        <section className={`${adminChrome.panel} p-0 sm:p-0`}>
          <div className="border-b border-white/50 px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex flex-col items-center">
              <div className={`${adminChrome.metricCard} w-full max-w-md text-center`}>
                <p className={adminChrome.metricLabel}>{t("summaryLabel")}</p>
                <p className={`${adminChrome.metricValue} text-xl`}>
                  {t("summary", {
                    count: enabledCount,
                    total: HOME_PAGE_SECTION_KEYS.length,
                  })}
                </p>
              </div>
              <AdminHomeSectionsStatusNotice />
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
                onToggle={requestSectionToggle}
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

      <OmmConfirmDialog
        isOpen={pendingToggle !== null}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={isBusy ? t("saving") : confirmCopy.confirmLabel}
        cancelLabel={t("cancelButton")}
        backdropAriaLabel={t("modalBackdropClose")}
        tone={confirmCopy.tone}
        confirmClassName={confirmCopy.confirmClassName}
        pending={isBusy}
        onConfirm={() => {
          void confirmSectionToggle();
        }}
        onCancel={closeConfirm}
      />
    </>
  );
}
