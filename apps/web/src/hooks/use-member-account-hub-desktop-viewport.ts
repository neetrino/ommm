"use client";

import { useEffect, useState } from "react";
import {
  MEMBER_ACCOUNT_HUB_DESKTOP_VIEWPORT_MEDIA_QUERY,
  readMemberAccountHubDesktopViewport,
} from "@/lib/member-account-hub-viewport";

/** Touch hub (phones) vs fine-pointer desktop hub — same signal as `/user` viewport split. */
export function useMemberAccountHubDesktopViewport(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MEMBER_ACCOUNT_HUB_DESKTOP_VIEWPORT_MEDIA_QUERY);
    const sync = () => {
      setIsDesktop(readMemberAccountHubDesktopViewport());
    };
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  return isDesktop;
}
