"use client";

import { useSyncExternalStore } from "react";
import {
  MEMBER_ACCOUNT_HUB_DESKTOP_VIEWPORT_MEDIA_QUERY,
  readMemberAccountHubDesktopViewport,
} from "@/lib/member-account-hub-viewport";

function subscribeMemberAccountHubDesktopViewport(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(MEMBER_ACCOUNT_HUB_DESKTOP_VIEWPORT_MEDIA_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => {
    mediaQuery.removeEventListener("change", onStoreChange);
  };
}

/** Touch hub (phones) vs fine-pointer desktop hub — same signal as `/user` viewport split. */
export function useMemberAccountHubDesktopViewport(): boolean {
  return useSyncExternalStore(
    subscribeMemberAccountHubDesktopViewport,
    readMemberAccountHubDesktopViewport,
    () => false,
  );
}
