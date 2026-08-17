import { Suspense } from "react";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { SessionReviewsInboxSection } from "@/components/session-reviews/session-reviews-inbox-section";

export default function CoachSessionReviewsPage() {
  return (
    <AdminContentFrame>
      <Suspense fallback={null}>
        <SessionReviewsInboxSection
          endpoint="/session-reviews/coach"
          showAnonymousBadge={false}
        />
      </Suspense>
    </AdminContentFrame>
  );
}
