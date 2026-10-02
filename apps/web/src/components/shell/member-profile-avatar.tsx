"use client";

import { useState } from "react";
import { MARKETING_HEADER_GUEST_USER_ICON_CLASS } from "@/components/marketing/marketing-site-header-layout";
import { sanitizeImageSrcUrl } from "@/lib/sanitize-image-src-url";

type MemberProfileAvatarProps = {
  initials: string;
  imageSrc: string | null;
  /** Circle sizing for photo and initials (same footprint). */
  className?: string;
  /** Fallback sizing when `className` is omitted (e.g. header guest icon). */
  guestIconClassName?: string;
};

export function MemberProfileAvatar({
  initials,
  imageSrc,
  className,
  guestIconClassName = MARKETING_HEADER_GUEST_USER_ICON_CLASS,
}: MemberProfileAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const safeSrc =
    imageSrc !== null ? sanitizeImageSrcUrl(imageSrc) : null;

  const showPhoto = safeSrc !== null && failedSrc !== safeSrc;

  if (!showPhoto) {
    const shellClass = className ?? guestIconClassName;
    return (
      <span
        className={[
          "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/70 ommm-user-avatar-placeholder-surface font-semibold leading-none text-sage-800",
          "text-[0.55rem] lg:text-[0.65rem] nav-desktop:text-[0.7rem]",
          shellClass,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      >
        {initials}
      </span>
    );
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
        onError={() => setFailedSrc(safeSrc)}
      />
    </span>
  );
}
