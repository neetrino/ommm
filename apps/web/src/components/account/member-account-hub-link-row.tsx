"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { memberAccountHubLayout } from "@/components/account/member-account-hub-layout";
import { MemberAccountHubChevron } from "@/components/account/member-account-hub-chevron";
import { markMemberHubSheetNavigation } from "@/lib/member-hub-sheet-navigation";
import { WORKSPACE_ROUTE_PREFETCH } from "@/lib/workspace-nav-link";

type MemberAccountHubLinkRowProps = {
  href: string;
  label: string;
  icon: ReactNode;
  danger?: boolean;
  onNavigate?: () => void;
};

export function MemberAccountHubLinkRow({
  href,
  label,
  icon,
  danger = false,
  onNavigate,
}: MemberAccountHubLinkRowProps) {
  return (
    <Link
      href={href}
      prefetch={WORKSPACE_ROUTE_PREFETCH}
      className={[
        memberAccountHubLayout.menuRow,
        danger ? memberAccountHubLayout.menuRowDanger : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => {
        markMemberHubSheetNavigation();
        onNavigate?.();
      }}
    >
      <span className={memberAccountHubLayout.menuRowIcon}>{icon}</span>
      <span className={memberAccountHubLayout.menuRowLabel}>{label}</span>
      <MemberAccountHubChevron
        className={
          danger
            ? memberAccountHubLayout.menuRowDangerChevron
            : memberAccountHubLayout.menuRowChevron
        }
      />
    </Link>
  );
}
