import { Link } from "@/i18n/navigation";

type MemberUserHomeSignInPanelProps = {
  title: string;
  body: string;
  loginLabel: string;
};

export function MemberUserHomeSignInPanel({
  title,
  body,
  loginLabel,
}: MemberUserHomeSignInPanelProps) {
  return (
    <div className="ommm-admin-content">
      <div className="rounded-[28px] border border-amber-200/80 bg-amber-50/90 p-8 text-amber-950 backdrop-blur-md">
        <p className="font-serif text-lg font-semibold">{title}</p>
        <p className="mt-2 text-sm text-amber-900/90">{body}</p>
        <Link href="/login" className="ommm-admin-add-button mt-6 inline-flex">
          {loginLabel}
        </Link>
      </div>
    </div>
  );
}
