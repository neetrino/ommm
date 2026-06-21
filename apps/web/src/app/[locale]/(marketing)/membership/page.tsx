import { redirect } from "next/navigation";
import { ensureMarketingSectionEnabled } from "@/server/ensure-marketing-section-enabled";

export default async function MembershipMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await ensureMarketingSectionEnabled("memberships");
  const { locale } = await params;
  redirect(`/${locale}/package`);
}
