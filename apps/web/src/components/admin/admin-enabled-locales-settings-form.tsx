"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminEnabledLocalesStatusNotice } from "@/components/admin/admin-enabled-locales-status-notice";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminCenterToast, type AdminCenterToastTone } from "@/components/ui/admin-center-toast";
import { AnimatedToggleSwitch } from "@/components/ui/animated-toggle-switch";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import {
  APP_UI_LOCALES,
  countEnabledLocales,
  normalizeEnabledLocales,
  type AppUiLocale,
  type EnabledLocalesMap,
} from "@/lib/enabled-locales";
import { languageSwitcherEndonym } from "@/lib/language-switcher-locales";
import { revalidatePublicStudio } from "@/lib/revalidate-public-studio";

type AdminEnabledLocalesSettingsFormProps = {
  initial: EnabledLocalesMap;
};

type ToastState = { message: string; tone: AdminCenterToastTone } | null;

type PendingToggle = {
  locale: AppUiLocale;
  enabled: boolean;
};

export function AdminEnabledLocalesSettingsForm({
  initial,
}: AdminEnabledLocalesSettingsFormProps) {
  const t = useTranslations("adminPages.settings.languages");
  const router = useRouter();
  const saveInFlightRef = useRef(false);
  const [locales, setLocales] = useState<EnabledLocalesMap>(() =>
    normalizeEnabledLocales(initial),
  );
  const [prevInitial, setPrevInitial] = useState(initial);
  const [savingLocale, setSavingLocale] = useState<AppUiLocale | null>(null);
  const [pendingToggle, setPendingToggle] = useState<PendingToggle | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  if (prevInitial !== initial) {
    setPrevInitial(initial);
    setLocales(normalizeEnabledLocales(initial));
  }

  const enabledCount = countEnabledLocales(locales);
  const isBusy = savingLocale !== null;

  async function persistLocale(
    locale: AppUiLocale,
    enabled: boolean,
    previous: EnabledLocalesMap,
  ): Promise<boolean> {
    if (saveInFlightRef.current) {
      return false;
    }

    const nextLocales: EnabledLocalesMap = {
      ...normalizeEnabledLocales(previous),
      [locale]: enabled,
    };

    if (countEnabledLocales(nextLocales) < 1) {
      setToast({ message: t("mustKeepOne"), tone: "err" });
      return false;
    }

    saveInFlightRef.current = true;
    setSavingLocale(locale);
    setLocales(nextLocales);
    setToast(null);

    try {
      await apiFetch("/studio/enabled-locales", {
        method: "PATCH",
        body: JSON.stringify({ locales: nextLocales }),
      });
      await revalidatePublicStudio();
      setToast({ message: t("saved"), tone: "ok" });
      router.refresh();
      return true;
    } catch (error) {
      setLocales(previous);
      setToast({
        message: error instanceof ApiError ? error.message : t("failed"),
        tone: "err",
      });
      return false;
    } finally {
      saveInFlightRef.current = false;
      setSavingLocale(null);
    }
  }

  function requestLocaleToggle(locale: AppUiLocale, enabled: boolean): void {
    if (isBusy || locales[locale] === enabled) {
      return;
    }

    if (!enabled && enabledCount <= 1) {
      setToast({ message: t("mustKeepOne"), tone: "err" });
      return;
    }

    setPendingToggle({ locale, enabled });
  }

  function closeConfirm(): void {
    if (isBusy) {
      return;
    }
    setPendingToggle(null);
  }

  async function confirmLocaleToggle(): Promise<void> {
    if (pendingToggle === null || isBusy) {
      return;
    }

    const { locale, enabled } = pendingToggle;
    const saved = await persistLocale(locale, enabled, locales);
    if (saved) {
      closeConfirm();
    }
  }

  const pendingLabel =
    pendingToggle === null ? "" : languageSwitcherEndonym(pendingToggle.locale);
  const confirmCopy =
    pendingToggle?.enabled === false
      ? {
          title: t("confirmDisableTitle", { language: pendingLabel }),
          description: t("confirmDisableDescription", { language: pendingLabel }),
          confirmLabel: t("disableLanguageButton"),
          tone: "danger" as const,
          confirmClassName: "ommm-btn-lifecycle-action--danger",
        }
      : {
          title: t("confirmEnableTitle", { language: pendingLabel }),
          description: t("confirmEnableDescription", { language: pendingLabel }),
          confirmLabel: t("enableLanguageButton"),
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
                    total: APP_UI_LOCALES.length,
                  })}
                </p>
              </div>
              <AdminEnabledLocalesStatusNotice />
            </div>
          </div>

          <div className="flex flex-col gap-1 px-2 pb-3 pt-1 sm:px-3 sm:pb-4 sm:pt-2">
            {APP_UI_LOCALES.map((locale) => {
              const enabled = locales[locale];
              const label = languageSwitcherEndonym(locale);
              const saving = savingLocale === locale;
              const lockLastEnabled = enabled && enabledCount <= 1;

              return (
                <div
                  key={locale}
                  className="group rounded-2xl border border-transparent px-2 py-3 transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-white/70 hover:bg-white/45 hover:shadow-[0_10px_28px_-22px_rgba(45,40,35,0.2)] sm:px-3 sm:py-3.5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sage-900">{label}</p>
                      <p className={`${adminChrome.metaText} mt-1 max-w-2xl leading-relaxed`}>
                        {t(`locales.${locale}.description`)}
                      </p>
                    </div>

                    <div className="flex items-center sm:shrink-0 sm:justify-end">
                      <button
                        type="button"
                        className="inline-flex shrink-0 cursor-pointer items-center rounded-full p-1 transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={t("toggleAria", {
                          language: label,
                          state: enabled ? t("stateEnabled") : t("stateDisabled"),
                        })}
                        aria-pressed={enabled}
                        aria-busy={saving}
                        disabled={isBusy || lockLastEnabled}
                        onClick={() => requestLocaleToggle(locale, !enabled)}
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
            })}
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
          void confirmLocaleToggle();
        }}
        onCancel={closeConfirm}
      />
    </>
  );
}
