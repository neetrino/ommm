"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  MemberAccountHubMenuActionRows,
  MemberAccountHubMobileActionRows,
} from "@/components/account/member-account-hub-action-rows";
import { useMemberAccountHubDesktopViewport } from "@/hooks/use-member-account-hub-desktop-viewport";
import { memberAccountHubLayout } from "@/components/account/member-account-hub-layout";
import { MemberAccountHubLinkRow } from "@/components/account/member-account-hub-link-row";
import { MemberAccountHubNavIcon } from "@/components/account/member-account-hub-nav-icons";
import type { MemberAccountHubProfile } from "@/components/account/member-account-hub-profile";
import { MEMBER_ACCOUNT_HUB_NAV } from "@/lib/member-account-hub-nav";

export type MemberAccountHubMenuPanelProps = MemberAccountHubProfile & {
  /** `sheet` — inside the mobile bottom sheet popup. */
  presentation?: "page" | "sheet";
  onNavigate?: () => void;
};

export function MemberAccountHubMenuPanel({
  displayName,
  email,
  imageSrc,
  initials,
  presentation = "page",
  onNavigate,
}: MemberAccountHubMenuPanelProps) {
  const tNav = useTranslations("dashboard.nav");
  const tHub = useTranslations("userPages.accountHub");
  const isDesktopHub = useMemberAccountHubDesktopViewport();

  return (
    <div
      className={
        presentation === "sheet"
          ? `${memberAccountHubLayout.shell} ${memberAccountHubLayout.shellSheet}`
          : memberAccountHubLayout.shell
      }
    >
      <header className={memberAccountHubLayout.header}>
        <div className={memberAccountHubLayout.avatarWrap}>
          <div className={memberAccountHubLayout.avatar} aria-hidden>
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt=""
                width={76}
                height={76}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-sage-800 sm:text-3xl">
                {initials}
              </span>
            )}
          </div>
        </div>
        <div className="min-w-0">
          <p className={memberAccountHubLayout.name}>{displayName}</p>
          <p className={memberAccountHubLayout.email}>{email}</p>
        </div>
      </header>

      <nav
        className={memberAccountHubLayout.menuCard}
        aria-label={tHub("menuAria")}
      >
        {MEMBER_ACCOUNT_HUB_NAV.map((item) => (
          <MemberAccountHubLinkRow
            key={item.href}
            href={item.href}
            label={tNav(`USER.${item.labelKey}`)}
            icon={<MemberAccountHubNavIcon item={item} />}
            onNavigate={onNavigate}
          />
        ))}

        {isDesktopHub ? <MemberAccountHubMenuActionRows /> : null}
      </nav>

      {!isDesktopHub ? <MemberAccountHubMobileActionRows /> : null}
    </div>
  );
}
