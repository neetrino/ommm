"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
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
  const [persisting, setPersisting] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  function select(next: LanguageSwitcherLocaleCode) {
    if (next === locale) {
      onAfterSelect?.();
      return;
    }
    const previous = locale;
    setUiLocaleCookie(next);
    setPersisting(true);
    void (async () => {
      try {
        await apiFetch<{ user: { locale: string } }>("/users/me", {
          method: "PATCH",
          body: JSON.stringify({ locale: next }),
        });
      } catch (err) {
        const isGuest = err instanceof ApiError && err.status === 401;
        if (!isGuest) {
          setUiLocaleCookie(previous);
          setPersisting(false);
          return;
        }
      }
      setPersisting(false);
      startTransition(() => {
        router.replace(pathname, { locale: next });
        onAfterSelect?.();
      });
    })();
  }

  const triggerLabel = `${t("switcherAria")}: ${t(`optionNames.${effectiveLocale}`)}`;
  const options: readonly DropdownOption<LanguageSwitcherLocaleCode>[] = LANGUAGE_SWITCHER_ORDER.map(
    (code) => ({
      value: code,
      label: code,
    }),
  );

  const rootMinWidth = isIconMarketing ? "min-w-0" : "min-w-[5.5rem]";

  return (
    <div
      ref={rootRef}
      className={`ommm-dropdown-root shrink-0 ${rootMinWidth} ${className}`.trim()}
    >
      <DropdownSelect<LanguageSwitcherLocaleCode>
        label={effectiveLocale}
        ariaLabel={triggerLabel}
        value={effectiveLocale}
        options={options}
        onChange={select}
        disabled={pending || persisting}
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
        renderValue={() =>
          isIconMarketing ? (
            <span className="inline-flex items-center justify-center">
              {renderIconTrigger?.()}
            </span>
          ) : (
            <span className="inline-flex min-w-0 flex-1 items-center gap-1.5">
              <LocaleFlagIcon code={effectiveLocale} />
              <span>{effectiveLocale}</span>
            </span>
          )
        }
        renderOption={(option, selected) => (
          <>
            <LocaleFlagIcon code={option.value} />
            <span className="min-w-0 flex-1">
              {isIconMarketing ? t(`optionNames.${option.value}`) : option.label}
            </span>
            <span className="sr-only">{t(`optionNames.${option.value}`)}</span>
          </>
        )}
      />
    </div>
  );
}
