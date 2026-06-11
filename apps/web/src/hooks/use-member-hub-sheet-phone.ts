"use client";

import { useSyncExternalStore } from "react";
import {
  MEMBER_HUB_SHEET_PHONE_MEDIA_QUERY,
  peekMemberHubSheetNavigation,
  subscribeMemberHubSheetNavigation,
} from "@/lib/member-hub-sheet-navigation";

/** Synchronous phone check — use in layout effects before paint. */
export function readMemberHubSheetPhoneViewport(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia(MEMBER_HUB_SHEET_PHONE_MEDIA_QUERY).matches;
}

/** Phone viewport or an in-flight hub sheet navigation (opens sheet immediately on tap). */
export function readShowMemberHubMobileSheet(): boolean {
  return readMemberHubSheetPhoneViewport() || peekMemberHubSheetNavigation();
}

function subscribeMemberHubSheetPhoneViewport(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(MEMBER_HUB_SHEET_PHONE_MEDIA_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => {
    mediaQuery.removeEventListener("change", onStoreChange);
  };
}

function subscribeShowMemberHubMobileSheet(onStoreChange: () => void): () => void {
  const unsubscribeViewport = subscribeMemberHubSheetPhoneViewport(onStoreChange);
  const unsubscribeNav = subscribeMemberHubSheetNavigation(onStoreChange);
  return () => {
    unsubscribeViewport();
    unsubscribeNav();
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

/** Whether the member hub mobile bottom sheet should mount (phone or hub link navigation). */
export function useShowMemberHubMobileSheet(): boolean {
  return useSyncExternalStore(
    subscribeShowMemberHubMobileSheet,
    readShowMemberHubMobileSheet,
    () => false,
  );
}
