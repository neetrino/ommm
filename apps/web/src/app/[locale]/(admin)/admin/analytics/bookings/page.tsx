import { AdminAnalyticsTabPage } from "@/components/admin/admin-analytics-tab-page";

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminAnalyticsBookingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: PageSearchParams;
}) {
  const { locale } = await params;
  const search = await searchParams;
  return AdminAnalyticsTabPage({ locale, section: "bookings", search });
}
