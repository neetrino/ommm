import { ContentPostsPanel } from "@/components/admin/content-posts-panel";

export default async function AdminContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ContentPostsPanel wellnessChrome locale={locale} />;
}
