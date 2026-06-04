"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition, type ReactNode } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import { captureLocaleSwitchScroll } from "@/lib/locale-switch-scroll";
import { setUiLocaleCookie } from "@/lib/ui-locale-cookie";
import type { DashboardShellVariant } from "@/components/shell/dashboard-shell-types";
import { LocaleFlagIcon } from "@/components/i18n/locale-flag-icon";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";
import { routing } from "@/i18n/routing";
import {
  LANGUAGE_SWITCHER_ORDER,
  type LanguageSwitcherLocaleCode,
  isLanguageSwitcherLocale,
} from "@/lib/language-switcher-locales";

/** Icon-only marketing trigger is 44px; menu needs room for flag + label. */
const MARKETING_ICON_MENU_MIN_WIDTH_PX = 168;

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
  dashboardVariant = "neutral",
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
  const [pending, startTransition] = useTransition();

  const current: LanguageSwitcherLocaleCode | null = isLanguageSwitcherLocale(
    locale,
  )
    ? locale
    : null;

  const effectiveLocale: LanguageSwitcherLocaleCode =
    current ??
    (isLanguageSwitcherLocale(routing.defaultLocale)
      ? routing.defaultLocale
      : "hy");

  const isIconMarketing =
    context === "marketing" && appearance === "icon";
  const flagFrame =
    dashboardVariant === "wellness" ||
    dashboardVariant === "admin" ||
    dashboardVariant === "member"
      ? "warm"
      : "default";

  function select(next: LanguageSwitcherLocaleCode) {
    if (next === locale) {
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

  const triggerLabel = `${t("switcherAria")}: ${t(`optionNames.${effectiveLocale}`)}`;
  const options: readonly DropdownOption<LanguageSwitcherLocaleCode>[] = LANGUAGE_SWITCHER_ORDER.map(
    (code) => ({
      value: code,
      label: t(`optionNames.${code}`),
    }),
  );

  const rootMinWidth = isIconMarketing ? "min-w-0" : "min-w-[5.5rem]";

  return (
    <div
      className={`ommm-dropdown-root shrink-0 ${rootMinWidth} ${className}`.trim()}
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
        disableMenuScroll
        renderValue={() =>
          isIconMarketing ? (
            <span className="inline-flex items-center justify-center">
              {renderIconTrigger?.()}
            </span>
          ) : (
            <span className="inline-flex min-w-0 flex-1 items-center gap-1.5">
              <LocaleFlagIcon code={effectiveLocale} frame={flagFrame} />
              <span>{t(`optionNames.${effectiveLocale}`)}</span>
            </span>
          )
        }
        renderOption={(option, selected) => (
          <>
            <LocaleFlagIcon code={option.value} />
            <span className="min-w-0 flex-1">{option.label}</span>
            {selected ? <span className="sr-only">{t("switcherAria")}</span> : null}
          </>
        )}
      />
    </div>
  );
}
