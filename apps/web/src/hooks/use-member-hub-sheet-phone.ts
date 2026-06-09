"use client";

import { useLayoutEffect, useState } from "react";
import { MEMBER_HUB_SHEET_PHONE_MEDIA_QUERY } from "@/lib/member-hub-sheet-navigation";

/** Synchronous phone check — use in layout effects before paint. */
export function readMemberHubSheetPhoneViewport(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia(MEMBER_HUB_SHEET_PHONE_MEDIA_QUERY).matches;
}

/** Phone viewport where member hub sections use bottom sheets (<744px). */
export function useMemberHubSheetPhone(): boolean {
  const [isPhone, setIsPhone] = useState(readMemberHubSheetPhoneViewport);

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia(MEMBER_HUB_SHEET_PHONE_MEDIA_QUERY);
    const sync = (): void => {
      setIsPhone(readMemberHubSheetPhoneViewport());
    };

    sync();
    mediaQuery.addEventListener("change", sync);

    return () => {
      mediaQuery.removeEventListener("change", sync);
    };
  }, []);

  return isPhone;
}
