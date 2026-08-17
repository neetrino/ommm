import { MemberHubSheetPage } from "@/components/account/member-hub-sheet-page";
import { SessionReviewsMemberSection } from "@/components/session-reviews/session-reviews-member-section";

export default function UserSessionReviewsSheetPage() {
  return (
    <MemberHubSheetPage titleNamespace="sessionReviewsPages" titleKey="memberTitle">
      <SessionReviewsMemberSection embeddedInSheet />
    </MemberHubSheetPage>
  );
}
