import Image from "next/image";

type MemberProfileAvatarProps = {
  initials: string;
  imageSrc: string | null;
  className?: string;
};

export function MemberProfileAvatar({
  initials,
  imageSrc,
  className = "",
}: MemberProfileAvatarProps) {
  const surface = `ommm-admin-profile-avatar ${className}`.trim();

  if (imageSrc) {
    return (
      <span className={`${surface} overflow-hidden p-0`}>
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

  return (
    <span className={surface} aria-hidden>
      {initials}
    </span>
  );
}
