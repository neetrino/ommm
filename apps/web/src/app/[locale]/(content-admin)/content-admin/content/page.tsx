import { ContentPostsPanel } from "@/components/admin/content-posts-panel";

export default async function ContentAdminContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ContentPostsPanel locale={locale} />;
}
