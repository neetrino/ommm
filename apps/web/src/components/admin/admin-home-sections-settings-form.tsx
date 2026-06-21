"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { AnimatedToggleSwitch } from "@/components/ui/animated-toggle-switch";
import { OmmButton } from "@/components/ui/omm-button";
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

type SectionRowProps = {
  sectionKey: HomePageSectionKey;
  enabled: boolean;
  busy: boolean;
  onToggle: (key: HomePageSectionKey, enabled: boolean) => void;
};

function marketingNavKeyForSection(
  key: HomePageSectionKey,
): "home" | "story" | "schedule" | "memberships" | "coaches" | "explore" | "contact" {
  return key;
}

function HomeSectionVisibilityRow({
  sectionKey,
  enabled,
  busy,
  onToggle,
}: SectionRowProps) {
  const t = useTranslations("adminPages.settings.homeSections");
  const tNav = useTranslations("nav");

  return (
    <div className="flex items-start justify-between gap-4 border-b border-sage-100 py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sage-900">{tNav(marketingNavKeyForSection(sectionKey))}</p>
        <p className={`${adminChrome.metaText} mt-1 max-w-2xl`}>
          {t(`sections.${sectionKey}.description`)}
        </p>
      </div>
      <button
        type="button"
        className="inline-flex shrink-0 cursor-pointer items-center rounded-full p-1 transition-opacity hover:opacity-85 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={t("toggleAria", {
          section: tNav(marketingNavKeyForSection(sectionKey)),
          state: enabled ? t("stateEnabled") : t("stateDisabled"),
        })}
        disabled={busy}
        onClick={() => onToggle(sectionKey, !enabled)}
      >
        <AnimatedToggleSwitch checked={enabled} className="ommm-toggle-switch-board" />
      </button>
    </div>
  );
}

export function AdminHomeSectionsSettingsForm({
  initial,
}: AdminHomeSectionsSettingsFormProps) {
  const t = useTranslations("adminPages.settings.homeSections");
  const router = useRouter();
  const [sections, setSections] = useState<HomePageSectionVisibility>(initial);
  const [savedSections, setSavedSections] = useState<HomePageSectionVisibility>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");

  const enabledCount = useMemo(
    () => HOME_PAGE_SECTION_KEYS.filter((key) => sections[key]).length,
    [sections],
  );

  const isDirty = useMemo(
    () => HOME_PAGE_SECTION_KEYS.some((key) => sections[key] !== savedSections[key]),
    [sections, savedSections],
  );

  function setSectionEnabled(key: HomePageSectionKey, enabled: boolean): void {
    setSections((current) => ({ ...current, [key]: enabled }));
    setMsg(null);
  }

  async function save(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (busy || !isDirty) {
      return;
    }

    setBusy(true);
    setMsg(null);

    try {
      await apiFetch("/studio/home-sections", {
        method: "PATCH",
        body: JSON.stringify({ sections }),
      });
      await revalidatePublicStudio();
      setSavedSections(sections);
      setTone("ok");
      setMsg(t("saved"));
      router.refresh();
    } catch (error) {
      setTone("err");
      setMsg(error instanceof ApiError ? error.message : t("failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-6">
      <AdminSectionShell banner={tone === "ok" ? msg : null}>
        {msg && tone === "err" ? (
          <p
            className="rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800 shadow-[0_12px_28px_-18px_rgba(45,40,35,0.18)]"
            role="alert"
          >
            {msg}
          </p>
        ) : null}

        <section className={adminChrome.panel}>
          <h2 className={adminChrome.panelHeading}>{t("panelTitle")}</h2>
          <p className={`${adminChrome.metaText} mt-1 max-w-2xl`}>{t("panelDescription")}</p>
          <div className="mt-5 divide-y divide-sage-100 border-t border-sage-100">
            <div className="flex flex-wrap items-center justify-between gap-3 py-4">
              <p className={`${adminChrome.metaText} max-w-2xl`}>
                {t("summary", { count: enabledCount, total: HOME_PAGE_SECTION_KEYS.length })}
              </p>
            </div>
            {HOME_PAGE_SECTION_DEFINITIONS.map((definition) => (
              <HomeSectionVisibilityRow
                key={definition.key}
                sectionKey={definition.key}
                enabled={sections[definition.key]}
                busy={busy}
                onToggle={setSectionEnabled}
              />
            ))}
          </div>
        </section>
      </AdminSectionShell>

      <footer className={`${adminChrome.panel} flex justify-end`}>
        <OmmButton type="submit" variant="primary" disabled={busy || !isDirty}>
          {busy ? t("saving") : t("save")}
        </OmmButton>
      </footer>
    </form>
  );
}
