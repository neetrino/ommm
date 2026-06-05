import type { ReactNode } from "react";
import {
  resolvePublicPackageTierSessionCount,
  type PublicPackageTierPlan,
} from "@/components/marketing/packages/public-package-tier-display";

export type PublicPackageTierIconKey =
  | "person"
  | "dumbbell"
  | "group"
  | "star"
  | "crown"
  | "welcome";

/** Maps tier session count / name to the mobile card icon (Figma Reformer Group). */
export function resolvePublicPackageTierIconKey(plan: PublicPackageTierPlan): PublicPackageTierIconKey {
  const normalizedName = (plan.name ?? "").trim().toLocaleLowerCase();
  if (normalizedName.includes("welcome")) {
    return "welcome";
  }

  const sessions = resolvePublicPackageTierSessionCount(plan);
  if (sessions === 8) {
    return "dumbbell";
  }
  if (sessions === 16) {
    return "group";
  }
  if (sessions === 24) {
    return "star";
  }
  if (sessions >= 48) {
    return "crown";
  }
  return "person";
}

type TierIconProps = {
  iconKey: PublicPackageTierIconKey;
};

function IconSvg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-[68%] w-[68%]">
      {children}
    </svg>
  );
}

export function PublicPackageTierSessionIcon({ iconKey }: TierIconProps) {
  const stroke = "currentColor";
  const strokeWidth = 1.6;

  switch (iconKey) {
    case "welcome":
      return (
        <IconSvg>
          <path
            d="M12 3l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 8.2l5-.7L12 3z"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        </IconSvg>
      );
    case "dumbbell":
      return (
        <IconSvg>
          <path
            d="M4 9v6M20 9v6M7 10.5v3M17 10.5v3M7 12h10"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </IconSvg>
      );
    case "group":
      return (
        <IconSvg>
          <circle cx="9" cy="9" r="2.5" stroke={stroke} strokeWidth={strokeWidth} />
          <circle cx="16" cy="10" r="2" stroke={stroke} strokeWidth={strokeWidth} />
          <path
            d="M5.5 18c.4-2 2-3.2 3.5-3.2S12.1 16 12.5 18M13 18c.3-1.6 1.6-2.6 2.8-2.6 1 0 2 .6 2.4 2.6"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </IconSvg>
      );
    case "star":
      return (
        <IconSvg>
          <path
            d="M12 4.5l1.8 3.7 4.1.6-3 2.9.7 4.1L12 14.3l-3.6 1.9.7-4.1-3-2.9 4.1-.6L12 4.5z"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        </IconSvg>
      );
    case "crown":
      return (
        <IconSvg>
          <path
            d="M5 17h14M6.5 17l1.2-7 3.3 3.5L12 7l1 6.5 3.3-3.5 1.2 7"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </IconSvg>
      );
    default:
      return (
        <IconSvg>
          <circle cx="12" cy="8.5" r="3" stroke={stroke} strokeWidth={strokeWidth} />
          <path
            d="M6.5 18.5c.8-2.6 2.8-4 5.5-4s4.7 1.4 5.5 4"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </IconSvg>
      );
  }
}
