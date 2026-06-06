import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { ContentPostsPanel } from "@/components/admin/content-posts-panel";

export default async function AdminContentPage() {
  return (
    <AdminContentFrame>
      <ContentPostsPanel />
    </AdminContentFrame>
  );
}
