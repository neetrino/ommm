"use client";

import { useSyncExternalStore } from "react";
import { MEMBER_HUB_SHEET_PHONE_MEDIA_QUERY } from "@/lib/member-hub-sheet-navigation";

/** Synchronous phone check — use in layout effects before paint. */
export function readMemberHubSheetPhoneViewport(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia(MEMBER_HUB_SHEET_PHONE_MEDIA_QUERY).matches;
}

function subscribeMemberHubSheetPhoneViewport(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(MEMBER_HUB_SHEET_PHONE_MEDIA_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => {
    mediaQuery.removeEventListener("change", onStoreChange);
  };
}

/** Phone viewport where member hub sections use bottom sheets (<744px). */
export function useMemberHubSheetPhone(): boolean {
  return useSyncExternalStore(
    subscribeMemberHubSheetPhoneViewport,
    readMemberHubSheetPhoneViewport,
    () => false,
  );
}
