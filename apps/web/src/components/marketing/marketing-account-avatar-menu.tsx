"use client";

import { LogoutButton } from "@/components/logout-button";
import { MemberProfileAvatar } from "@/components/shell/member-profile-avatar";
import { Link } from "@/i18n/navigation";

type MarketingAccountAvatarMenuProps = {
  initials: string;
  imageSrc: string | null;
  displayName: string;
  profileHref: string;
  triggerClassName: string;
  onAfterSelect?: () => void;
};

/** Logged-in marketing header avatar — click opens dashboard; hover reveals logout below. */
export function MarketingAccountAvatarMenu({
  initials,
  imageSrc,
  displayName,
  profileHref,
  triggerClassName,
  onAfterSelect,
}: MarketingAccountAvatarMenuProps) {
  return (
    <div className="ommm-marketing-account-menu ommm-marketing-account-hover-anchor">
      <Link
        href={profileHref}
        className={triggerClassName}
        aria-label={displayName}
        onClick={() => onAfterSelect?.()}
      >
        <MemberProfileAvatar initials={initials} imageSrc={imageSrc} />
      </Link>
      <div className="ommm-marketing-account-logout-popover">
        <LogoutButton
          className="ommm-marketing-account-menu-action ommm-marketing-account-menu-logout"
          iconClassName="ommm-marketing-account-menu-action-icon"
        />
      </div>
    </div>
  );
}
