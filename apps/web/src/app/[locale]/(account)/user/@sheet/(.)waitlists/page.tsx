import { MemberHubSheetPage } from "@/components/account/member-hub-sheet-page";
import { MemberUserWaitlistsRouteContent } from "@/components/account/member-user-waitlists-route-content";

export default async function UserWaitlistsSheetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <MemberHubSheetPage locale={locale} titleNamespace="userPages.waitlists">
      <MemberUserWaitlistsRouteContent locale={locale} embeddedInSheet />
    </MemberHubSheetPage>
  );
}
