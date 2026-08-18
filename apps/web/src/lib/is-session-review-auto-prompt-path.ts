import { memberUserPathWithoutLocale } from "@/lib/member-user-hub-sheet-paths";
import { USER_ACCOUNT_PATH } from "@/lib/role-home";

const MEMBER_REVIEWS_PATH = "/user/reviews";

/**
 * Auto review prompt only on member hub / reviews — never marketing Home.
 */
export function isSessionReviewAutoPromptPath(pathname: string): boolean {
  const path = memberUserPathWithoutLocale(pathname);
  return (
    path === USER_ACCOUNT_PATH ||
    path === MEMBER_REVIEWS_PATH ||
    path.startsWith(`${MEMBER_REVIEWS_PATH}/`)
  );
}
