import { redirect } from "next/navigation";
import { ensureMarketingSectionEnabled } from "@/server/ensure-marketing-section-enabled";

export default async function MarketingPackageCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; categoryKey: string }>;
}) {
  await ensureMarketingSectionEnabled("memberships");
  const { locale } = await params;
  redirect(`/${locale}/package`);
}
