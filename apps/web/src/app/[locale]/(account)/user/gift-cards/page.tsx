import { MemberUserGiftCardsRouteContent } from "@/components/account/member-user-gift-cards-route-content";
import { MemberUserRouteFrame } from "@/components/account/member-user-route-frame";

export default async function UserGiftCardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ locale }, search] = await Promise.all([params, searchParams]);

  return (
    <MemberUserRouteFrame>
      <MemberUserGiftCardsRouteContent locale={locale} search={search} />
    </MemberUserRouteFrame>
  );
}
