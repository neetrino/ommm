import { MemberHubSheetPage } from "@/components/account/member-hub-sheet-page";
import { MemberUserPaymentsRouteContent } from "@/components/account/member-user-payments-route-content";

export default async function UserPaymentsSheetPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;

  return (
    <MemberHubSheetPage locale={locale} titleNamespace="userPages.payments">
      <MemberUserPaymentsRouteContent locale={locale} search={search} embeddedInSheet />
    </MemberHubSheetPage>
  );
}
