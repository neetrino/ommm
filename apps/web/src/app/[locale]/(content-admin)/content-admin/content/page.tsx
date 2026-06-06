import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { ContentPostsPanel } from "@/components/admin/content-posts-panel";

export default async function ContentAdminContentPage() {
  return (
    <AdminContentFrame>
      <AdminSectionShell>
        <ContentPostsPanel />
      </AdminSectionShell>
    </AdminContentFrame>
  );
}
