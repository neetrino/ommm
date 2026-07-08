import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  fetchMemberBookings,
  fetchMemberWaitlist,
  fetchPublishedPosts,
} from "../../../lib/api/memberClient";
import { readStoredAccessToken } from "../../../auth/accessTokenStorage";
import { useLocale } from "../../../i18n/I18nProvider";
import { bookingToNextClassContent, pickNextUpcomingBooking } from "../lib/mapBookingsToNextClass";
import { postsToExploreContent } from "../lib/mapPostsToExplore";
import { waitlistRowsToItems } from "../lib/mapWaitlistToItems";
import type { NextClassContent } from "../components/NextClassSection";
import type { ExploreTileMock, WaitlistItem } from "../../../lib/mocks/homeMock";
import {
  useExploreFallbackContent,
  useHomeMarketingCopy,
} from "./useHomeContent";
import { useMemberBookingCopy } from "../../member/hooks/useMemberBookingCopy";

export type MemberHomeFeedState = {
  loading: boolean;
  error: string | null;
  nextClass: NextClassContent | null;
  waitlistItems: WaitlistItem[];
  explore: {
    journalEyebrow: string;
    journalTitle: string;
    tiles: ExploreTileMock[];
  };
};

export function useMemberHomeFeed(isSignedIn: boolean): MemberHomeFeedState {
  const locale = useLocale();
  const exploreFallback = useExploreFallbackContent();
  const homeCopy = useHomeMarketingCopy();
  const bookingCopy = useMemberBookingCopy();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextClass, setNextClass] = useState<NextClassContent | null>(null);
  const [waitlistItems, setWaitlistItems] = useState<WaitlistItem[]>([]);
  const [explore, setExplore] = useState(exploreFallback);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const posts = await fetchPublishedPosts();
      setExplore(postsToExploreContent(posts, exploreFallback));
      if (!isSignedIn) {
        setNextClass(null);
        setWaitlistItems([]);
        return;
      }
      const token = await readStoredAccessToken();
      if (token === null) {
        setNextClass(null);
        setWaitlistItems([]);
        return;
      }
      const [bookings, waitlist] = await Promise.all([
        fetchMemberBookings(token),
        fetchMemberWaitlist(token),
      ]);
      const next = pickNextUpcomingBooking(bookings);
      setNextClass(
        next === null
          ? null
          : bookingToNextClassContent(next, {
              ...bookingCopy,
              spotsLabel: bookingCopy.spotsCapacity,
            }),
      );
      setWaitlistItems(
        waitlistRowsToItems(waitlist, bookingCopy.intlLocale, ({ index, status }) =>
          bookingCopy.waitlistBadge(index, status),
        ),
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : homeCopy.feedError;
      setError(msg);
      setExplore(exploreFallback);
      setNextClass(null);
      setWaitlistItems([]);
    } finally {
      setLoading(false);
    }
  }, [bookingCopy, exploreFallback, homeCopy.feedError, isSignedIn]);

  useEffect(() => {
    void load();
  }, [locale]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return { loading, error, nextClass, waitlistItems, explore };
}
