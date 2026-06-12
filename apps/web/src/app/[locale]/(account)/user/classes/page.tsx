import { MemberUserClassesRouteContent } from "@/components/account/member-user-classes-route-content";
import { MemberUserRouteFrame } from "@/components/account/member-user-route-frame";

export default async function UserClassesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ locale }, search] = await Promise.all([params, searchParams]);

  return (
    <MemberUserRouteFrame>
      <MemberUserClassesRouteContent locale={locale} search={search} />
    </MemberUserRouteFrame>
  );
}
