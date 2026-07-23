import { MemberUserBookingsRouteContent } from "@/components/account/member-user-bookings-route-content";
import { MemberUserRouteFrame } from "@/components/account/member-user-route-frame";

export default async function UserBookingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ locale }, search] = await Promise.all([params, searchParams]);

  return (
    <MemberUserRouteFrame>
      <MemberUserBookingsRouteContent locale={locale} search={search} />
    </MemberUserRouteFrame>
  );
}
