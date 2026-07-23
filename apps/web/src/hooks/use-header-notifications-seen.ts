"use client";

import { useCallback, useState } from "react";
import {
  countUnreadNotificationOffers,
  markNotificationIdsSeen,
  readSeenNotificationIds,
} from "@/lib/header-notifications-seen";

export function useHeaderNotificationsSeen() {
  const [seenIds, setSeenIds] = useState<ReadonlySet<string>>(() => readSeenNotificationIds());

  const markAllSeen = useCallback((offerIds: readonly string[]) => {
    markNotificationIdsSeen(offerIds);
    setSeenIds(readSeenNotificationIds());
  }, []);

  const countUnread = useCallback(
    (offerIds: readonly string[]) => countUnreadNotificationOffers(offerIds, seenIds),
    [seenIds],
  );

  return { seenIds, markAllSeen, countUnread };
}
