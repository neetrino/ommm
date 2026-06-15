"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  BookingPackageSelectModal,
  type EligibleBookingPackage,
} from "@/components/account/booking-package-select-modal";
import {
  clearBookPackageSessionQuery,
  readBookPackageSessionId,
  setBookPackageSessionQuery,
} from "@/lib/book-package-session-url";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";

type BookSessionResponse = {
  id: string;
};

type UseSessionBookingOptions = {
  sessionId: string;
  locale: string;
  onBooked?: (bookingId: string) => void;
  onError?: (message: string) => void;
};

export function useSessionBooking({
  sessionId,
  locale,
  onBooked,
  onError,
}: UseSessionBookingOptions) {
  const t = useTranslations("forms.bookSession");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlPickSessionId = readBookPackageSessionId(searchParams);
  const onBookedRef = useRef(onBooked);
  const onErrorRef = useRef(onError);
  onBookedRef.current = onBooked;
  onErrorRef.current = onError;

  const [busy, setBusy] = useState(false);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [eligiblePackages, setEligiblePackages] = useState<
    readonly EligibleBookingPackage[]
  >([]);
  const skipNextUrlRestoreRef = useRef(false);

  function replaceSearchParams(mutate: (params: URLSearchParams) => void): void {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function openPackageModal(eligible: readonly EligibleBookingPackage[]): void {
    skipNextUrlRestoreRef.current = true;
    setEligiblePackages(eligible);
    setPackageModalOpen(true);
    replaceSearchParams((params) => {
      setBookPackageSessionQuery(params, sessionId);
    });
  }

  function closePackageModal(): void {
    if (busy) {
      return;
    }
    setPackageModalOpen(false);
    if (urlPickSessionId === sessionId) {
      replaceSearchParams(clearBookPackageSessionQuery);
    }
  }

  async function fetchEligiblePackages(): Promise<EligibleBookingPackage[]> {
    return apiFetch<EligibleBookingPackage[]>(
      `/bookings/sessions/${sessionId}/eligible-packages`,
    );
  }

  async function bookWithOptionalPackage(userPackageId?: string): Promise<void> {
    const booking = await apiFetch<BookSessionResponse>(
      `/bookings/sessions/${sessionId}`,
      {
        method: "POST",
        body: JSON.stringify(
          userPackageId !== undefined ? { userPackageId } : {},
        ),
      },
    );
    onBookedRef.current?.(booking.id);
  }

  async function initiateBooking(): Promise<void> {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      const eligible = await fetchEligiblePackages();
      if (eligible.length > 1) {
        openPackageModal(eligible);
        return;
      }
      await bookWithOptionalPackage(eligible[0]?.userPackageId);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : t("bookFailed");
      onErrorRef.current?.(message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (urlPickSessionId !== sessionId) {
      return;
    }
    if (skipNextUrlRestoreRef.current) {
      skipNextUrlRestoreRef.current = false;
      return;
    }

    let cancelled = false;

    async function restorePackageModal(): Promise<void> {
      setBusy(true);
      try {
        const eligible = await fetchEligiblePackages();
        if (cancelled) {
          return;
        }
        if (eligible.length > 1) {
          setEligiblePackages(eligible);
          setPackageModalOpen(true);
          return;
        }
        replaceSearchParams(clearBookPackageSessionQuery);
      } catch (error) {
        if (cancelled) {
          return;
        }
        replaceSearchParams(clearBookPackageSessionQuery);
        const message = error instanceof ApiError ? error.message : t("bookFailed");
        onErrorRef.current?.(message);
      } finally {
        if (!cancelled) {
          setBusy(false);
        }
      }
    }

    void restorePackageModal();

    return () => {
      cancelled = true;
    };
  }, [sessionId, urlPickSessionId, pathname, router, searchParams, t]);

  const packageModal =
    packageModalOpen ? (
      <BookingPackageSelectModal
        isOpen={packageModalOpen}
        sessionId={sessionId}
        eligiblePackages={eligiblePackages}
        locale={locale}
        onClose={closePackageModal}
        onBooked={(bookingId) => {
          setPackageModalOpen(false);
          replaceSearchParams(clearBookPackageSessionQuery);
          onBookedRef.current?.(bookingId);
        }}
        onError={(message) => onErrorRef.current?.(message)}
      />
    ) : null;

  return {
    busy,
    initiateBooking,
    packageModal,
  };
}
