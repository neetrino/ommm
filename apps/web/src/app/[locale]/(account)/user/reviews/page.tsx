import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { SessionReviewsMemberSection } from "@/components/session-reviews/session-reviews-member-section";

export default function UserSessionReviewsPage() {
  return (
    <AdminContentFrame>
      <SessionReviewsMemberSection />
    </AdminContentFrame>
  );
}
