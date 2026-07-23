import { redirect } from "next/navigation";

export default async function AdminAnalyticsIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    const normalized = Array.isArray(value) ? value[0] : value;
    if (normalized) {
      query.set(key, normalized);
    }
  }
  const suffix = query.toString();
  redirect(suffix ? `/${locale}/admin/analytics/overview?${suffix}` : `/${locale}/admin/analytics/overview`);
}
