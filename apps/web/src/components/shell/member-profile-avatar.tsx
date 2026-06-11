import Image from "next/image";
import { MarketingHeaderUserIcon } from "@/components/marketing/marketing-header-icons";
import { MARKETING_HEADER_GUEST_USER_ICON_CLASS } from "@/components/marketing/marketing-site-header-layout";

type MemberProfileAvatarProps = {
  initials: string;
  imageSrc: string | null;
  /** Photo circle sizing — used only when `imageSrc` is set. */
  className?: string;
  /** Matches logged-out header user icon sizing when there is no photo. */
  guestIconClassName?: string;
};

export function MemberProfileAvatar({
  imageSrc,
  className,
  guestIconClassName = MARKETING_HEADER_GUEST_USER_ICON_CLASS,
}: MemberProfileAvatarProps) {
  if (imageSrc) {
    const photoClass = className
      ? [
          "flex shrink-0 items-center justify-center overflow-hidden rounded-full p-0",
          className,
        ]
      : ["ommm-admin-profile-avatar overflow-hidden p-0"];

    return (
      <span className={photoClass.filter(Boolean).join(" ")}>
        <Image
          src={imageSrc}
          alt=""
          width={32}
          height={32}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  return <MarketingHeaderUserIcon className={guestIconClassName} />;
}
