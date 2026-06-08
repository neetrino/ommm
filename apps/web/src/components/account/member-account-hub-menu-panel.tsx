"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { MemberAccountHubActionRows } from "@/components/account/member-account-hub-action-rows";
import { memberAccountHubLayout } from "@/components/account/member-account-hub-layout";
import { MemberAccountHubLinkRow } from "@/components/account/member-account-hub-link-row";
import {
  HubLockIcon,
  MemberAccountHubNavIcon,
} from "@/components/account/member-account-hub-nav-icons";
import type { MemberAccountHubProfile } from "@/components/account/member-account-hub-profile";
import {
  MEMBER_ACCOUNT_HUB_CHANGE_PASSWORD_HREF,
  MEMBER_ACCOUNT_HUB_NAV,
} from "@/lib/member-account-hub-nav";

export type MemberAccountHubMenuPanelProps = MemberAccountHubProfile & {
  onNavigate?: () => void;
};

export function MemberAccountHubMenuPanel({
  displayName,
  email,
  initials,
  imageSrc,
  onNavigate,
}: MemberAccountHubMenuPanelProps) {
  const tNav = useTranslations("dashboard.nav");
  const tHub = useTranslations("userPages.accountHub");

  return (
    <div className={memberAccountHubLayout.shell}>
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
              initials
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

        <MemberAccountHubLinkRow
          href={MEMBER_ACCOUNT_HUB_CHANGE_PASSWORD_HREF}
          label={tHub("changePassword")}
          icon={<HubLockIcon />}
          onNavigate={onNavigate}
        />

        <MemberAccountHubActionRows />
      </nav>
    </div>
  );
}
