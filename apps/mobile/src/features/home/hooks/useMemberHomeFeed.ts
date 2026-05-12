import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  fetchMemberBookings,
  fetchMemberWaitlist,
  fetchPublishedPosts,
} from "../../../lib/api/memberClient";
import { readStoredAccessToken } from "../../../auth/accessTokenStorage";
import { bookingToNextClassContent, pickNextUpcomingBooking } from "../lib/mapBookingsToNextClass";
import { postsToExploreContent } from "../lib/mapPostsToExplore";
import { waitlistRowsToItems } from "../lib/mapWaitlistToItems";
import type { NextClassContent } from "../components/NextClassSection";
import type { ExploreTileMock } from "../../../lib/mocks/homeMock";
import type { WaitlistItem } from "../../../lib/mocks/homeMock";

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

const emptyExplore = postsToExploreContent([]);

export function useMemberHomeFeed(isSignedIn: boolean): MemberHomeFeedState {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextClass, setNextClass] = useState<NextClassContent | null>(null);
  const [waitlistItems, setWaitlistItems] = useState<WaitlistItem[]>([]);
  const [explore, setExplore] = useState(emptyExplore);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const posts = await fetchPublishedPosts();
      setExplore(postsToExploreContent(posts));
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
      setNextClass(next === null ? null : bookingToNextClassContent(next));
      setWaitlistItems(waitlistRowsToItems(waitlist));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load home";
      setError(msg);
      setExplore(emptyExplore);
      setNextClass(null);
      setWaitlistItems([]);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return { loading, error, nextClass, waitlistItems, explore };
}
