"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { MemberAccountHubSectionSheet } from "@/components/account/member-account-hub-section-sheet";

type MemberHubSheetClientShellProps = {
  titleNamespace: string;
  /** Defaults to `title` — use `memberTitle` for session reviews, etc. */
  titleKey?: string;
  desktopSidePanel?: boolean;
  children: ReactNode;
};

/** Client shell — sheet mounts immediately without waiting on server translations. */
export function MemberHubSheetClientShell({
  titleNamespace,
  titleKey = "title",
  desktopSidePanel = false,
  children,
}: MemberHubSheetClientShellProps) {
  const t = useTranslations(titleNamespace);
  const tShell = useTranslations("dashboard.shell");

  return (
    <MemberAccountHubSectionSheet
      title={t(titleKey)}
      closeLabel={tShell("closeMenu")}
      backdropCloseLabel={tShell("closeMenuOverlay")}
      desktopSidePanel={desktopSidePanel}
    >
      {children}
    </MemberAccountHubSectionSheet>
  );
}
