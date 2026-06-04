import Image from "next/image";

type MemberProfileAvatarProps = {
  initials: string;
  imageSrc: string | null;
};

export function MemberProfileAvatar({
  initials,
  imageSrc,
}: MemberProfileAvatarProps) {
  if (imageSrc) {
    return (
      <span className="ommm-admin-profile-avatar overflow-hidden p-0">
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
    <span className="ommm-admin-profile-avatar" aria-hidden>
      {initials}
    </span>
  );
}
