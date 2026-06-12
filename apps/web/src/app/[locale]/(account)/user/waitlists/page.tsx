import { MemberUserWaitlistsRouteContent } from "@/components/account/member-user-waitlists-route-content";
import { MemberUserRouteFrame } from "@/components/account/member-user-route-frame";

export default async function UserWaitlistsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <MemberUserRouteFrame>
      <MemberUserWaitlistsRouteContent locale={locale} />
    </MemberUserRouteFrame>
  );
}
