"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useTransition, type ReactNode } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useEnabledLocales } from "@/components/i18n/enabled-locales-context";
import { apiFetch } from "@/lib/api";
import {
  countEnabledLocales,
  listEnabledLocales,
  resolveFallbackLocale,
  type AppUiLocale,
} from "@/lib/enabled-locales";
import { captureLocaleSwitchScroll } from "@/lib/locale-switch-scroll";
import { setUiLocaleCookie } from "@/lib/ui-locale-cookie";
import type { DashboardShellVariant } from "@/components/shell/dashboard-shell-types";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";
import { routing } from "@/i18n/routing";
import {
  type LanguageSwitcherLocaleCode,
  isLanguageSwitcherLocale,
  languageSwitcherEndonym,
} from "@/lib/language-switcher-locales";

/** Icon-only marketing trigger; menu needs room for language labels. */
const MARKETING_ICON_MENU_MIN_WIDTH_PX = 120;

export type LanguageSwitcherProps = {
  context: "marketing" | "dashboard";
  appearance?: "dropdown" | "icon";
  dashboardVariant?: DashboardShellVariant;
  compact?: boolean;
  className?: string;
  triggerClassName?: string;
  renderIconTrigger?: () => ReactNode;
  onAfterSelect?: () => void;
};

export function LanguageSwitcher({
  context,
  appearance = "dropdown",
  compact = false,
  className = "",
  triggerClassName,
  renderIconTrigger,
  onAfterSelect,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("language");
  const enabledLocales = useEnabledLocales();
  const [pending, startTransition] = useTransition();

  const availableLocales = useMemo(
    () => listEnabledLocales(enabledLocales),
    [enabledLocales],
  );

  const current: LanguageSwitcherLocaleCode | null = isLanguageSwitcherLocale(
    locale,
  )
    ? locale
    : null;

  const effectiveLocale: LanguageSwitcherLocaleCode = useMemo(() => {
    if (current !== null && enabledLocales[current]) {
      return current;
    }

    const fallback = resolveFallbackLocale(enabledLocales);
    if (isLanguageSwitcherLocale(fallback)) {
      return fallback;
    }

    return isLanguageSwitcherLocale(routing.defaultLocale)
      ? routing.defaultLocale
      : "en";
  }, [current, enabledLocales]);

  if (countEnabledLocales(enabledLocales) <= 1) {
    return null;
  }

  const isIconMarketing =
    context === "marketing" && appearance === "icon";

  function select(next: LanguageSwitcherLocaleCode) {
    if (next === locale) {
      onAfterSelect?.();
      return;
    }

    if (!enabledLocales[next as AppUiLocale]) {
      onAfterSelect?.();
      return;
    }

    setUiLocaleCookie(next);
    captureLocaleSwitchScroll();
    startTransition(() => {
      router.replace(pathname, { locale: next, scroll: false });
      onAfterSelect?.();
    });

    void apiFetch<{ user: { locale: string } }>("/users/me", {
      method: "PATCH",
      body: JSON.stringify({ locale: next }),
    }).catch(() => {
      // Guest or offline — cookie + URL are the source of truth for marketing UI.
    });
  }

  const triggerLabel = `${t("switcherAria")}: ${languageSwitcherEndonym(effectiveLocale)}`;
  const options: readonly DropdownOption<LanguageSwitcherLocaleCode>[] =
    availableLocales.map((code) => ({
      value: code,
      label: languageSwitcherEndonym(code),
    }));

  const rootMinWidth = isIconMarketing ? "min-w-0" : "min-w-[5.5rem]";

  return (
    <div
      className={`ommm-dropdown-root ommm-language-switcher-root shrink-0 ${rootMinWidth} ${className}`.trim()}
    >
      <DropdownSelect<LanguageSwitcherLocaleCode>
        label={effectiveLocale}
        ariaLabel={triggerLabel}
        value={effectiveLocale}
        options={options}
        onChange={select}
        disabled={pending}
        triggerClassName={
          triggerClassName ??
          (compact
            ? "ommm-dropdown-trigger--compact min-h-9 px-2.5 text-[11px]"
            : "ommm-dropdown-trigger--compact")
        }
        showChevron={!isIconMarketing}
        menuMinWidth={isIconMarketing ? MARKETING_ICON_MENU_MIN_WIDTH_PX : undefined}
        menuAlign={isIconMarketing ? "end" : "start"}
        menuClassName="ommm-language-switcher-menu"
        animateMenuDismiss={isIconMarketing}
        disableMenuScroll
        renderValue={() =>
          isIconMarketing ? (
            <span className="inline-flex items-center justify-center">
              {renderIconTrigger?.()}
            </span>
          ) : (
            <span className="min-w-0 flex-1 truncate text-center text-sm font-semibold leading-none text-[#464646]">
              {languageSwitcherEndonym(effectiveLocale)}
            </span>
          )
        }
        renderOption={(option, selected) => (
          <>
            <span className="ommm-language-switcher-option-row whitespace-nowrap leading-none">
              {option.label}
            </span>
            {selected ? <span className="sr-only">{t("switcherAria")}</span> : null}
          </>
        )}
      />
    </div>
  );
}
