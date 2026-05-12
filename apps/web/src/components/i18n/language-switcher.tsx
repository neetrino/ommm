"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { setUiLocaleCookie } from "@/lib/ui-locale-cookie";
import type { DashboardShellVariant } from "@/components/shell/dashboard-shell-types";
import { LocaleFlagIcon } from "@/components/i18n/locale-flag-icon";
import { useDismissWhenOutside } from "@/hooks/use-dismiss-when-outside";
import { routing } from "@/i18n/routing";
import {
  LANGUAGE_SWITCHER_ORDER,
  type LanguageSwitcherLocaleCode,
  isLanguageSwitcherLocale,
} from "@/lib/language-switcher-locales";

function triggerClass(
  context: "marketing" | "dashboard",
  variant: DashboardShellVariant,
  compact: boolean,
): string {
  const pad = compact
    ? "gap-1 px-2 py-1 text-[10px] sm:px-2.5 sm:text-[11px]"
    : "gap-1.5 px-2.5 py-1.5 text-xs sm:px-3 sm:text-sm";
  const base = `${pad} inline-flex min-w-0 shrink-0 items-center rounded-full font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1`;
  if (context === "marketing") {
    return `${base} border border-white/60 bg-white/55 text-sage-800 shadow-sm ring-white/40 hover:bg-white/75 focus-visible:ring-sand-500`;
  }
  if (variant === "indigo") {
    return `${base} border border-indigo-200 bg-white text-indigo-950 shadow-sm hover:bg-indigo-50 focus-visible:ring-indigo-600`;
  }
  if (variant === "wellness") {
    return `${base} border border-white/35 bg-white/25 text-sage-900 backdrop-blur-sm hover:bg-white/40 focus-visible:ring-sand-500`;
  }
  return `${base} border border-zinc-200 bg-white text-zinc-900 shadow-sm hover:bg-zinc-50 focus-visible:ring-zinc-900`;
}

function dropdownClass(
  context: "marketing" | "dashboard",
  variant: DashboardShellVariant,
): string {
  const base =
    "absolute left-0 top-full z-50 mt-1 min-w-[9.5rem] overflow-hidden py-1 shadow-lg";
  if (context === "marketing") {
    return `${base} rounded-xl border border-white/70 bg-white/95 backdrop-blur-md`;
  }
  if (variant === "indigo") {
    return `${base} rounded-xl border border-indigo-100 bg-white`;
  }
  if (variant === "wellness") {
    return `${base} rounded-xl border border-white/40 bg-white/90 backdrop-blur-md`;
  }
  return `${base} rounded-xl border border-zinc-200 bg-white`;
}

function optionRowClass(
  context: "marketing" | "dashboard",
  variant: DashboardShellVariant,
  selected: boolean,
  compact: boolean,
): string {
  const pad = compact ? "gap-1.5 px-2 py-1.5 text-[11px]" : "gap-2 px-3 py-2 text-sm";
  const base = `${pad} flex w-full items-center text-left font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset`;
  const sel = selected ? " bg-black/[0.06]" : "";
  if (context === "marketing") {
    return `${base} text-sage-800 hover:bg-white/80 focus-visible:ring-sand-500${sel}`;
  }
  if (variant === "indigo") {
    return `${base} text-indigo-950 hover:bg-indigo-50 focus-visible:ring-indigo-600${sel}`;
  }
  if (variant === "wellness") {
    return `${base} text-sage-900 hover:bg-white/50 focus-visible:ring-sand-500${sel}`;
  }
  return `${base} text-zinc-900 hover:bg-zinc-50 focus-visible:ring-zinc-900${sel}`;
}

function chevronClass(open: boolean): string {
  return [
    "ml-0.5 h-4 w-4 shrink-0 text-current transition-transform",
    open ? "rotate-180" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function ChevronDownIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type ListboxProps = {
  listId: string;
  switcherAria: string;
  context: "marketing" | "dashboard";
  dashboardVariant: DashboardShellVariant;
  compact: boolean;
  locale: string;
  pending: boolean;
  getOptionName: (code: LanguageSwitcherLocaleCode) => string;
  onPick: (code: LanguageSwitcherLocaleCode) => void;
};

function LanguageSwitcherListbox({
  listId,
  switcherAria,
  context,
  dashboardVariant,
  compact,
  locale,
  pending,
  getOptionName,
  onPick,
}: ListboxProps) {
  return (
    <ul
      id={listId}
      role="listbox"
      aria-label={switcherAria}
      className={dropdownClass(context, dashboardVariant)}
    >
      {LANGUAGE_SWITCHER_ORDER.map((code) => {
        const selected = locale === code;
        return (
          <li key={code} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={selected}
              className={optionRowClass(
                context,
                dashboardVariant,
                selected,
                compact,
              )}
              disabled={pending}
              onClick={() => onPick(code)}
            >
              <LocaleFlagIcon code={code} frame="default" />
              <span className="min-w-0 flex-1">{code}</span>
              <span className="sr-only">{getOptionName(code)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export type LanguageSwitcherProps = {
  context: "marketing" | "dashboard";
  dashboardVariant?: DashboardShellVariant;
  compact?: boolean;
  className?: string;
  onAfterSelect?: () => void;
};

export function LanguageSwitcher({
  context,
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dismissRef = useRef<() => void>(() => {});
  const listId = useId();

  useEffect(() => {
    dismissRef.current = () => setOpen(false);
  }, []);

  useDismissWhenOutside(open, rootRef, dismissRef);

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
    context === "dashboard" && dashboardVariant === "wellness"
      ? "warm"
      : "default";

  function select(next: LanguageSwitcherLocaleCode) {
    if (next === locale) {
      setOpen(false);
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
        setOpen(false);
        onAfterSelect?.();
      });
    })();
  }

  const triggerLabel = `${t("switcherAria")}: ${t(`optionNames.${effectiveLocale}`)}`;

  return (
    <div ref={rootRef} className={`relative shrink-0 ${className}`.trim()}>
      <button
        type="button"
        className={triggerClass(context, dashboardVariant, compact)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-label={triggerLabel}
        title={t("expandPicker")}
        disabled={pending || persisting}
        onClick={() => setOpen((v) => !v)}
      >
        <LocaleFlagIcon code={effectiveLocale} frame={flagFrame} />
        <span>{effectiveLocale}</span>
        <ChevronDownIcon className={chevronClass(open)} />
      </button>

      {open ? (
        <LanguageSwitcherListbox
          listId={listId}
          switcherAria={t("switcherAria")}
          context={context}
          dashboardVariant={dashboardVariant}
          compact={compact}
          locale={locale}
          pending={pending || persisting}
          getOptionName={(code) => t(`optionNames.${code}`)}
          onPick={select}
        />
      ) : null}
    </div>
  );
}
