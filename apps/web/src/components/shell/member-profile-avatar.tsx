import Image from "next/image";

type MemberProfileAvatarProps = {
  initials: string;
  imageSrc: string | null;
  className?: string;
  variant?: "admin" | "marketing";
};

export function MemberProfileAvatar({
  initials,
  imageSrc,
  className,
  variant = "admin",
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

  const initialsClass = [
    variant === "marketing" ? "ommm-marketing-profile-avatar" : "ommm-admin-profile-avatar",
    "shrink-0",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={initialsClass} aria-hidden>
      {initials}
    </span>
  );
}
