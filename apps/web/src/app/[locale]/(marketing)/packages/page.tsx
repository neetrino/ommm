import { redirect } from "next/navigation";

export default async function PackagesMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/package`);
}
