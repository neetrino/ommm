import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { MemberUserWaitlistsRouteContent } from "@/components/account/member-user-waitlists-route-content";

export default async function UserWaitlistsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <MemberContentFrame>
      <MemberUserWaitlistsRouteContent locale={locale} />
    </MemberContentFrame>
  );
}
