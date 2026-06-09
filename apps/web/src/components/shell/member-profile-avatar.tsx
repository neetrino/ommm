import Image from "next/image";
import { MarketingHeaderUserIcon } from "@/components/marketing/marketing-header-icons";

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
  guestIconClassName = "h-6 w-6 shrink-0 lg:h-7 lg:w-7 nav-desktop:h-8 nav-desktop:w-8",
}: MemberProfileAvatarProps) {
  if (imageSrc) {
    const photoClass = [
      "ommm-admin-profile-avatar shrink-0 overflow-hidden p-0",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span className={photoClass}>
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
