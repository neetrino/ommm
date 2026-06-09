import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { MemberUserBookingsRouteContent } from "@/components/account/member-user-bookings-route-content";

export default async function UserBookingsPage({
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
      <MemberUserBookingsRouteContent locale={locale} search={search} />
    </MemberContentFrame>
  );
}
