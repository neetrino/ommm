"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ADMIN_BOOKINGS_ACTION_QUERY_KEY,
  ADMIN_BOOKINGS_BOOKING_ID_QUERY_KEY,
  ADMIN_BOOKINGS_MOVE_ACTION,
  bookingRowKey,
  buildLoadingBookingRow,
  mapAdminBookingDetailToRow,
  parseBookingRowKey,
  type AdminBookingDetailPayload,
  type AdminBookingRow,
} from "@/components/admin/admin-bookings-query";
import { usePathname, useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";

type UseAdminBookingsDetailSelectionParams = {
  calendarRows: readonly AdminBookingRow[];
  listRows: readonly AdminBookingRow[];
};

export function useAdminBookingsDetailSelection({
  calendarRows,
  listRows,
}: UseAdminBookingsDetailSelectionParams) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlBookingKey = searchParams.get(ADMIN_BOOKINGS_BOOKING_ID_QUERY_KEY);
  const urlAction = searchParams.get(ADMIN_BOOKINGS_ACTION_QUERY_KEY);
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(urlBookingKey);
  const [prevUrlBookingKey, setPrevUrlBookingKey] = useState(urlBookingKey);
  const [fetchedRow, setFetchedRow] = useState<AdminBookingRow | null>(null);

  if (urlBookingKey !== prevUrlBookingKey) {
    setPrevUrlBookingKey(urlBookingKey);
    setSelectedRowKey(urlBookingKey);
  }

  if (selectedRowKey === null && fetchedRow !== null) {
    setFetchedRow(null);
  }

  const replaceSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutator(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const pushSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutator(params);
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const openBookingDetails = useCallback(
    (row: AdminBookingRow) => {
      const key = bookingRowKey(row);
      setSelectedRowKey(key);
      pushSearchParams((params) => {
        params.set(ADMIN_BOOKINGS_BOOKING_ID_QUERY_KEY, key);
      });
    },
    [pushSearchParams],
  );

  const closeBookingDetails = useCallback(() => {
    setSelectedRowKey(null);
    setFetchedRow(null);
    replaceSearchParams((params) => {
      params.delete(ADMIN_BOOKINGS_BOOKING_ID_QUERY_KEY);
      params.delete(ADMIN_BOOKINGS_ACTION_QUERY_KEY);
    });
  }, [replaceSearchParams]);

  const openMoveModal = useCallback(
    (row: AdminBookingRow) => {
      const key = bookingRowKey(row);
      setSelectedRowKey(key);
      pushSearchParams((params) => {
        params.set(ADMIN_BOOKINGS_BOOKING_ID_QUERY_KEY, key);
        params.set(ADMIN_BOOKINGS_ACTION_QUERY_KEY, ADMIN_BOOKINGS_MOVE_ACTION);
      });
    },
    [pushSearchParams],
  );

  const closeMoveModal = useCallback(() => {
    replaceSearchParams((params) => {
      params.delete(ADMIN_BOOKINGS_ACTION_QUERY_KEY);
    });
  }, [replaceSearchParams]);

  const selectedRow = useMemo(() => {
    if (selectedRowKey === null) {
      return null;
    }
    const combined = [...listRows, ...calendarRows];
    const found = combined.find((row) => bookingRowKey(row) === selectedRowKey);
    if (found !== undefined) {
      return found;
    }
    if (fetchedRow !== null && bookingRowKey(fetchedRow) === selectedRowKey) {
      return fetchedRow;
    }
    return null;
  }, [calendarRows, fetchedRow, listRows, selectedRowKey]);

  const showMoveModal =
    urlAction === ADMIN_BOOKINGS_MOVE_ACTION &&
    selectedRow !== null &&
    selectedRow.recordType === "BOOKING";

  const drawerRow = useMemo(() => {
    if (selectedRow !== null) {
      return selectedRow;
    }
    if (selectedRowKey === null) {
      return null;
    }
    return buildLoadingBookingRow(selectedRowKey);
  }, [selectedRow, selectedRowKey]);

  useEffect(() => {
    if (selectedRowKey === null) {
      return undefined;
    }

    const combined = [...listRows, ...calendarRows];
    if (combined.some((row) => bookingRowKey(row) === selectedRowKey)) {
      return undefined;
    }

    const parsed = parseBookingRowKey(selectedRowKey);
    if (parsed === null || parsed.recordType !== "BOOKING") {
      return undefined;
    }

    let cancelled = false;
    void apiFetch(`/bookings/admin/${parsed.id}`)
      .then((detail) => {
        if (cancelled) {
          return;
        }
        setFetchedRow(mapAdminBookingDetailToRow(detail as AdminBookingDetailPayload));
      })
      .catch(() => {
        if (!cancelled) {
          setFetchedRow(null);
          replaceSearchParams((params) => {
            params.delete(ADMIN_BOOKINGS_BOOKING_ID_QUERY_KEY);
            params.delete(ADMIN_BOOKINGS_ACTION_QUERY_KEY);
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [calendarRows, listRows, replaceSearchParams, selectedRowKey]);

  useEffect(() => {
    if (
      urlAction === ADMIN_BOOKINGS_MOVE_ACTION &&
      selectedRow !== null &&
      selectedRow.recordType !== "BOOKING"
    ) {
      replaceSearchParams((params) => {
        params.delete(ADMIN_BOOKINGS_ACTION_QUERY_KEY);
      });
    }
  }, [replaceSearchParams, selectedRow, urlAction]);

  return {
    selectedRowKey,
    selectedRow,
    drawerRow,
    showMoveModal,
    openBookingDetails,
    closeBookingDetails,
    openMoveModal,
    closeMoveModal,
  };
}
