import { MemberUserNotificationsRouteContent } from "@/components/account/member-user-notifications-route-content";
import { MemberUserRouteFrame } from "@/components/account/member-user-route-frame";

export default async function UserNotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <MemberUserRouteFrame>
      <MemberUserNotificationsRouteContent locale={locale} />
    </MemberUserRouteFrame>
  );
}
