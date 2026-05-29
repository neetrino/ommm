import { redirect } from "next/navigation";

export default async function MembershipsMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/packages`);
}
