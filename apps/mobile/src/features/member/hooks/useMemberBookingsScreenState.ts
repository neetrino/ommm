import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { readStoredAccessToken } from "../../../auth/accessTokenStorage";
import {
  fetchMemberBookings,
  type BookingMineRow,
} from "../../../lib/api/memberClient";
import { useMemberBookingsCopy } from "./useMemberBookingsCopy";

type UseMemberBookingsScreenStateParams = {
  isSignedIn: boolean;
};

export function useMemberBookingsScreenState({
  isSignedIn,
}: UseMemberBookingsScreenStateParams) {
  const copy = useMemberBookingsCopy();
  const [bookings, setBookings] = useState<BookingMineRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!isSignedIn) {
        setBookings([]);
        setError(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (mode === "initial") {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      try {
        const token = await readStoredAccessToken();
        if (token === null) {
          setBookings([]);
          setError(copy.signInRequired);
          return;
        }
        const rows = await fetchMemberBookings(token);
        setBookings(rows);
      } catch (e) {
        setBookings([]);
        setError(
          e instanceof Error ? e.message : copy.loadErrorFallback,
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [copy.loadErrorFallback, copy.signInRequired, isSignedIn],
  );

  useFocusEffect(
    useCallback(() => {
      void load("initial");
    }, [load]),
  );

  const refresh = useCallback(() => {
    void load("refresh");
  }, [load]);

  return {
    bookings,
    loading,
    refreshing,
    error,
    refresh,
    reload: () => load("initial"),
  };
}
