import {
  isMemberUserHubSheetPath,
  memberUserPathWithoutLocale,
} from "@/lib/member-user-hub-sheet-paths";
import { USER_ACCOUNT_PATH } from "@/lib/role-home";

/** True when pathname is anywhere under the member account namespace. */
export function isMemberUserAreaPath(pathname: string): boolean {
  const current = memberUserPathWithoutLocale(pathname);
  return current === USER_ACCOUNT_PATH || current.startsWith(`${USER_ACCOUNT_PATH}/`);
}

/** Matches `ommm-member-hub-sheet-overlay` (`tablet:hidden`). */
export const MEMBER_HUB_SHEET_PHONE_MEDIA_QUERY = "(max-width: 743px)";

const MEMBER_HUB_SHEET_NAV_KEY = "ommm.memberHubSheetNav";
const MEMBER_HUB_SCROLL_Y_KEY = "ommm.memberHubScrollY";
const MEMBER_HUB_SHEET_NAV_EVENT = "ommm-member-hub-sheet-nav";

function notifyMemberHubSheetNavigation(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MEMBER_HUB_SHEET_NAV_EVENT));
  }
}

export function subscribeMemberHubSheetNavigation(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const onChange = (): void => {
    onStoreChange();
  };

  window.addEventListener(MEMBER_HUB_SHEET_NAV_EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(MEMBER_HUB_SHEET_NAV_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function isMemberUserHubSheetHref(href: string): boolean {
  return isMemberUserHubSheetPath(href);
}

/** True when the bell / hub row should open a member bottom sheet on phone. */
export function shouldUseMemberHubSheetNavigation(
  href: string,
  pathname: string,
): boolean {
  if (!isMemberUserHubSheetHref(href)) {
    return false;
  }
  const current = memberUserPathWithoutLocale(pathname);
  return isMemberUserAreaPath(current);
}

export function markMemberHubSheetNavigation(): void {
  try {
    if (typeof sessionStorage !== "undefined" && typeof window !== "undefined") {
      sessionStorage.setItem(MEMBER_HUB_SHEET_NAV_KEY, "1");
      sessionStorage.setItem(MEMBER_HUB_SCROLL_Y_KEY, String(window.scrollY));
      notifyMemberHubSheetNavigation();
    }
  } catch {
    /* ignore */
  }
}

/** Hub scroll depth saved when opening a member sheet from the account hub. */
export function peekMemberHubSheetScrollY(): number | null {
  try {
    if (typeof sessionStorage === "undefined") {
      return null;
    }
    const raw = sessionStorage.getItem(MEMBER_HUB_SCROLL_Y_KEY);
    if (raw === null) {
      return null;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearMemberHubSheetScrollY(): void {
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(MEMBER_HUB_SCROLL_Y_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function peekMemberHubSheetNavigation(): boolean {
  try {
    return (
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem(MEMBER_HUB_SHEET_NAV_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export function clearMemberHubSheetNavigation(): void {
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(MEMBER_HUB_SHEET_NAV_KEY);
      notifyMemberHubSheetNavigation();
    }
  } catch {
    /* ignore */
  }
}
