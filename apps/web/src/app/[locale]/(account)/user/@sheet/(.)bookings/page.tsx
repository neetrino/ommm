import { MemberHubSheetPage } from "@/components/account/member-hub-sheet-page";
import { MemberUserBookingsRouteContent } from "@/components/account/member-user-bookings-route-content";

export default async function UserBookingsSheetPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;

  return (
    <MemberHubSheetPage locale={locale} titleNamespace="userPages.bookings">
      <MemberUserBookingsRouteContent
        locale={locale}
        search={search}
        embeddedInSheet
      />
    </MemberHubSheetPage>
  );
}
