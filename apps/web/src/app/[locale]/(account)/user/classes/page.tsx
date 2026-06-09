import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { MemberUserClassesRouteContent } from "@/components/account/member-user-classes-route-content";

export default async function UserClassesPage({
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
      <MemberUserClassesRouteContent locale={locale} search={search} />
    </MemberContentFrame>
  );
}
