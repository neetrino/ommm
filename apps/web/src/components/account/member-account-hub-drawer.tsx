"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { MemberAccountHubMenuPanel } from "@/components/account/member-account-hub-menu-panel";
import type { MemberAccountHubProfile } from "@/components/account/member-account-hub-profile";
import { useCloseOnEscape } from "@/hooks/use-close-on-escape";
import { workspaceMobileDrawerLayout } from "@/components/shell/workspace-mobile-drawer-layout";

type MemberAccountHubDrawerProps = {
  open: boolean;
  onClose: () => void;
  profile: MemberAccountHubProfile;
};

/** Mobile member dashboard menu — account hub popup (replaces olive sidebar drawer). */
export function MemberAccountHubDrawer({
  open,
  onClose,
  profile,
}: MemberAccountHubDrawerProps) {
  const tShell = useTranslations("dashboard.shell");

  useCloseOnEscape(open, onClose);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className={workspaceMobileDrawerLayout.memberHubDrawerOverlay}
      id="dashboard-mobile-drawer"
      role="dialog"
      aria-modal="true"
      aria-label={tShell("navigationDialogAria")}
    >
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(26,28,27,0.32)] backdrop-blur-[2px]"
        aria-label={tShell("closeMenuOverlay")}
        onClick={onClose}
      />
      <div className={workspaceMobileDrawerLayout.memberHubDrawerPanel}>
        <MemberAccountHubMenuPanel {...profile} onNavigate={onClose} />
      </div>
    </div>
  );
}
