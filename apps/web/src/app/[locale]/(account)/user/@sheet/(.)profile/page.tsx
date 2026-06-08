import { MemberHubSheetPage } from "@/components/account/member-hub-sheet-page";
import { RoleProfilePage } from "@/components/account/role-profile-page";

export default async function UserProfileSheetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <MemberHubSheetPage locale={locale} titleNamespace="userPages.profile">
      <RoleProfilePage locale={locale} shellChrome="member" embeddedInSheet />
    </MemberHubSheetPage>
  );
}
