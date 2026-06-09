import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { MemberUserGiftCardsRouteContent } from "@/components/account/member-user-gift-cards-route-content";

export default async function UserGiftCardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;

  return (
    <MemberContentFrame>
      <MemberUserGiftCardsRouteContent locale={locale} search={search} />
    </MemberContentFrame>
  );
}
