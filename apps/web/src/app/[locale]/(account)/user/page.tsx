import { MemberUserHomePageContent } from "@/components/account/member-user-home-page-content";

/** Member `/user` — desktop dashboard; mobile glass account hub. */
export default async function UserAccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <MemberUserHomePageContent locale={locale} />;
}
