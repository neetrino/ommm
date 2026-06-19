import { redirect } from "next/navigation";

export default async function MarketingPackageCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; categoryKey: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/package`);
}
