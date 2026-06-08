import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { MemberUserPackagesRouteContent } from "@/components/account/member-user-packages-route-content";

export default async function UserPackagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <MemberContentFrame>
      <MemberUserPackagesRouteContent locale={locale} />
    </MemberContentFrame>
  );
}
