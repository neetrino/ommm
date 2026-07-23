import { MemberUserProgressRouteContent } from "@/components/account/member-user-progress-route-content";
import { MemberUserRouteFrame } from "@/components/account/member-user-route-frame";

export default async function UserProgressPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <MemberUserRouteFrame>
      <MemberUserProgressRouteContent locale={locale} />
    </MemberUserRouteFrame>
  );
}
