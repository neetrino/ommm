import { MemberUserNotificationsRouteContent } from "@/components/account/member-user-notifications-route-content";
import { MemberContentFrame } from "@/components/layout/member-content-frame";

export default async function UserNotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <MemberContentFrame>
      <MemberUserNotificationsRouteContent locale={locale} />
    </MemberContentFrame>
  );
}
