import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { MemberUserPaymentsRouteContent } from "@/components/account/member-user-payments-route-content";

export default async function UserPaymentsPage({
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
      <MemberUserPaymentsRouteContent locale={locale} search={search} />
    </MemberContentFrame>
  );
}
