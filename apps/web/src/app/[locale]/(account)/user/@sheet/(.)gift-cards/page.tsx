import { MemberHubSheetPage } from "@/components/account/member-hub-sheet-page";
import { MemberUserGiftCardsRouteContent } from "@/components/account/member-user-gift-cards-route-content";

export default async function UserGiftCardsSheetPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;

  return (
    <MemberHubSheetPage locale={locale} titleNamespace="userPages.giftCards">
      <MemberUserGiftCardsRouteContent locale={locale} search={search} embeddedInSheet />
    </MemberHubSheetPage>
  );
}
