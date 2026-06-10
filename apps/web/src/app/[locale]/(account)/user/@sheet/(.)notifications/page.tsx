import { MemberHubSheetPage } from "@/components/account/member-hub-sheet-page";
import { MemberUserNotificationsRouteContent } from "@/components/account/member-user-notifications-route-content";

export default async function UserNotificationsSheetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <MemberHubSheetPage
      locale={locale}
      titleNamespace="userPages.notifications"
      desktopSidePanel
    >
      <MemberUserNotificationsRouteContent locale={locale} />
    </MemberHubSheetPage>
  );
}
