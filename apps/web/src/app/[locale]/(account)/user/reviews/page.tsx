import { MemberUserRouteFrame } from "@/components/account/member-user-route-frame";
import { SessionReviewsMemberSection } from "@/components/session-reviews/session-reviews-member-section";

export default function UserSessionReviewsPage() {
  return (
    <MemberUserRouteFrame>
      <SessionReviewsMemberSection />
    </MemberUserRouteFrame>
  );
}
