"use client";

import { useState } from "react";
import { MarketingHeaderUserIcon } from "@/components/marketing/marketing-header-icons";
import { MARKETING_HEADER_GUEST_USER_ICON_CLASS } from "@/components/marketing/marketing-site-header-layout";
import { sanitizeImageSrcUrl } from "@/lib/sanitize-image-src-url";

type MemberProfileAvatarProps = {
  initials: string;
  imageSrc: string | null;
  /** Photo circle sizing — used only when `imageSrc` is set. */
  className?: string;
  /** Matches logged-out header user icon sizing when there is no photo. */
  guestIconClassName?: string;
};

type MemberProfileAvatarPhotoProps = {
  safeSrc: string;
  className?: string;
  guestIconClassName: string;
};

function MemberProfileAvatarPhoto({
  safeSrc,
  className,
  guestIconClassName,
}: MemberProfileAvatarPhotoProps) {
  const [loadFailed, setLoadFailed] = useState(false);

  if (loadFailed) {
    return <MarketingHeaderUserIcon className={guestIconClassName} />;
  }

  const photoClass = className
    ? [
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full p-0",
        className,
      ]
    : ["ommm-admin-profile-avatar overflow-hidden p-0"];

  return (
    <span className={photoClass.filter(Boolean).join(" ")}>
      {/* eslint-disable-next-line @next/next/no-img-element -- dynamic API upload URLs */}
      <img
        src={safeSrc}
        alt=""
        width={32}
        height={32}
        className="h-full w-full object-cover"
        onError={() => setLoadFailed(true)}
      />
    </span>
  );
}

export function MemberProfileAvatar({
  imageSrc,
  className,
  guestIconClassName = MARKETING_HEADER_GUEST_USER_ICON_CLASS,
}: MemberProfileAvatarProps) {
  const safeSrc =
    imageSrc !== null ? sanitizeImageSrcUrl(imageSrc) : null;

  if (safeSrc === null) {
    return <MarketingHeaderUserIcon className={guestIconClassName} />;
  }

  return (
    <MemberProfileAvatarPhoto
      key={safeSrc}
      safeSrc={safeSrc}
      className={className}
      guestIconClassName={guestIconClassName}
    />
  );
}
