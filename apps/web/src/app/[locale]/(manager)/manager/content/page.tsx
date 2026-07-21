import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { ContentPostsPanel } from "@/components/admin/content-posts-panel";
import { managerContentCapabilities } from "@/lib/backoffice-capabilities";

export default async function ManagerContentPage() {
  return (
    <AdminContentFrame>
      <ContentPostsPanel capabilities={managerContentCapabilities()} />
    </AdminContentFrame>
  );
}
