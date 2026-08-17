import { MemberUserHomePageContent } from "@/components/account/member-user-home-page-content";

/** Member `/user` — dashboard on all viewports (same as desktop web). */
export default async function UserAccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <MemberUserHomePageContent locale={locale} />;
}
