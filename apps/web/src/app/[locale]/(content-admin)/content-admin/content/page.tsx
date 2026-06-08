import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { ContentPostsPanel } from "@/components/admin/content-posts-panel";

export default async function ContentAdminContentPage() {
  return (
    <AdminContentFrame>
      <ContentPostsPanel />
    </AdminContentFrame>
  );
}
