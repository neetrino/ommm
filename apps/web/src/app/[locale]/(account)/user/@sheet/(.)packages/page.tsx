import { MemberHubSheetPage } from "@/components/account/member-hub-sheet-page";
import { MemberUserPackagesRouteContent } from "@/components/account/member-user-packages-route-content";

export default async function UserPackagesSheetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <MemberHubSheetPage titleNamespace="userPages.packages">
      <MemberUserPackagesRouteContent locale={locale} embeddedInSheet />
    </MemberHubSheetPage>
  );
}
