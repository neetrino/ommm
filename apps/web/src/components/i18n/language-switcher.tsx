"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { setUiLocaleCookie } from "@/lib/ui-locale-cookie";
import type { DashboardShellVariant } from "@/components/shell/dashboard-shell-types";
import { LocaleFlagIcon } from "@/components/i18n/locale-flag-icon";
import { DropdownCheckGlyph } from "@/components/ui/dropdown-check-glyph";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";
import { routing } from "@/i18n/routing";
import {
  LANGUAGE_SWITCHER_ORDER,
  type LanguageSwitcherLocaleCode,
  isLanguageSwitcherLocale,
} from "@/lib/language-switcher-locales";

export type LanguageSwitcherProps = {
  context: "marketing" | "dashboard";
  dashboardVariant?: DashboardShellVariant;
  compact?: boolean;
  className?: string;
  onAfterSelect?: () => void;
};

export function LanguageSwitcher({
  context: _context,
  dashboardVariant = "neutral",
  compact = false,
  className = "",
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

  const flagFrame =
    dashboardVariant === "wellness" || dashboardVariant === "admin"
      ? "warm"
      : "default";

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

  return (
    <div ref={rootRef} className={`ommm-dropdown-root min-w-[5.5rem] shrink-0 ${className}`.trim()}>
      <DropdownSelect<LanguageSwitcherLocaleCode>
        label={effectiveLocale}
        ariaLabel={triggerLabel}
        value={effectiveLocale}
        options={options}
        onChange={select}
        disabled={pending || persisting}
        triggerClassName={
          compact
            ? "ommm-dropdown-trigger--compact min-h-9 px-2.5 text-[11px]"
            : "ommm-dropdown-trigger--compact"
        }
        renderValue={() => (
          <span className="inline-flex min-w-0 flex-1 items-center gap-1.5">
            <LocaleFlagIcon code={effectiveLocale} frame={flagFrame} />
            <span>{effectiveLocale}</span>
          </span>
        )}
        renderOption={(option, selected) => (
          <>
            <span
              className="ommm-dropdown-checkbox"
              data-checked={selected ? "true" : "false"}
              aria-hidden
            >
              {selected ? <DropdownCheckGlyph className="h-3 w-3" /> : null}
            </span>
            <LocaleFlagIcon code={option.value} frame={flagFrame} />
            <span className="min-w-0 flex-1">{option.label}</span>
            <span className="sr-only">{t(`optionNames.${option.value}`)}</span>
          </>
        )}
      />
    </div>
  );
}
