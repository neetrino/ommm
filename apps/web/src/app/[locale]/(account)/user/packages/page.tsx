import { MemberUserPackagesRouteContent } from "@/components/account/member-user-packages-route-content";
import { MemberUserRouteFrame } from "@/components/account/member-user-route-frame";

export default async function UserPackagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <MemberUserRouteFrame>
      <MemberUserPackagesRouteContent locale={locale} />
    </MemberUserRouteFrame>
  );
}
