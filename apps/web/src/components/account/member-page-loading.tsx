import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { MemberPageContentSkeleton } from "@/components/account/member-page-content-skeleton";

/** Shared instant shell for `/user/*` route transitions. */
export function MemberPageLoading() {
  return (
    <MemberContentFrame>
      <MemberPageContentSkeleton rows={4} />
    </MemberContentFrame>
  );
}
