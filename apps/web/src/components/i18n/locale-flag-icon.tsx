import Image from "next/image";
import type { LanguageSwitcherLocaleCode } from "@/lib/language-switcher-locales";

const FLAG_SRC: Record<LanguageSwitcherLocaleCode, string> = {
  hy: "/i18n/flags/hy.png",
  en: "/i18n/flags/en.png",
  ru: "/i18n/flags/ru.png",
};

const FLAG_SIZE_CLASS =
  "inline-block h-3.5 w-5 shrink-0 rounded-[2px] object-cover";

type LocaleFlagIconProps = {
  code: LanguageSwitcherLocaleCode;
  className?: string;
};

/** Locale flag icons for the language switcher (PNG assets, no border). */
export function LocaleFlagIcon({
  code,
  className = "",
}: LocaleFlagIconProps) {
  return (
    <Image
      src={FLAG_SRC[code]}
      alt=""
      width={20}
      height={14}
      className={`${FLAG_SIZE_CLASS} ${className}`.trim()}
      aria-hidden
    />
  );
}
