import { MemberHubSheetPage } from "@/components/account/member-hub-sheet-page";
import { MemberUserClassesRouteContent } from "@/components/account/member-user-classes-route-content";

export default async function UserClassesSheetPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;

  return (
    <MemberHubSheetPage titleNamespace="userPages.classes">
      <MemberUserClassesRouteContent locale={locale} search={search} embeddedInSheet />
    </MemberHubSheetPage>
  );
}
