import { redirect } from "next/navigation";

export default async function MembershipMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/package`);
}
