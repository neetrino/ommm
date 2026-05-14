import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { Link } from "@/i18n/navigation";
import {
  HOME_HERO_CTA_FROST_BG,
  HOME_HERO_CTA_GOLD_BG,
  HOME_HERO_FIGMA,
  HOME_SCHEDULE_CTA_BG,
} from "@/components/marketing/home/home-hero-banner-tokens";

const HOME_SCHEDULE_PILL = {
  border: "#f7fbff",
  highlight: "#fffbdc",
} as const;

export type HomeMarketingPillVariant = "goldBooking" | "frostMembership" | "silverSchedule";

export type HomeMarketingPillLinkProps = {
  href: string;
  label: string;
  variant: HomeMarketingPillVariant;
};

/**
 * Figma pill CTAs (`161:363`, `170:1053`, `172:1059`) — gold, frost, or schedule gradient fills.
 */
export function HomeMarketingPillLink({ href, label, variant }: HomeMarketingPillLinkProps) {
  const pill = pillStyles[variant];
  return (
    <div className="relative shrink-0 sm:min-w-0">
      <div
        className="pointer-events-none absolute left-[3px] top-[4px] h-14 w-[calc(100%-6px)] rounded-full border-t-[5px]"
        style={{ borderColor: pill.highlight }}
        aria-hidden
      />
      <Link
        href={href}
        className={`${marketingMontserrat.className} relative flex h-14 min-h-14 items-center justify-center rounded-full border-[5px] px-5 text-center text-lg font-bold leading-7 text-white transition-[filter,transform] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:translate-y-px ${pill.minWidthClass}`}
        style={{
          borderColor: pill.border,
          backgroundImage: pill.backgroundImage,
        }}
      >
        {label}
      </Link>
    </div>
  );
}

const pillStyles: Record<
  HomeMarketingPillVariant,
  {
    border: string;
    highlight: string;
    backgroundImage: string;
    minWidthClass: string;
  }
> = {
  goldBooking: {
    border: HOME_HERO_FIGMA.primaryCtaBorder,
    highlight: HOME_HERO_FIGMA.primaryCtaHighlight,
    backgroundImage: HOME_HERO_CTA_GOLD_BG,
    minWidthClass: "sm:min-w-[191px]",
  },
  frostMembership: {
    border: HOME_HERO_FIGMA.secondaryCtaBorder,
    highlight: HOME_HERO_FIGMA.secondaryCtaHighlight,
    backgroundImage: HOME_HERO_CTA_FROST_BG,
    minWidthClass: "sm:min-w-[140px]",
  },
  silverSchedule: {
    border: HOME_SCHEDULE_PILL.border,
    highlight: HOME_SCHEDULE_PILL.highlight,
    backgroundImage: HOME_SCHEDULE_CTA_BG,
    minWidthClass: "sm:min-w-[178px]",
  },
};
