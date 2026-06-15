"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  BookingPackageSelectModal,
  type EligibleBookingPackage,
} from "@/components/account/booking-package-select-modal";
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
  const [busy, setBusy] = useState(false);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [eligiblePackages, setEligiblePackages] = useState<
    readonly EligibleBookingPackage[]
  >([]);

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
    onBooked?.(booking.id);
  }

  async function initiateBooking(): Promise<void> {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      const eligible = await apiFetch<EligibleBookingPackage[]>(
        `/bookings/sessions/${sessionId}/eligible-packages`,
      );
      if (eligible.length > 1) {
        setEligiblePackages(eligible);
        setPackageModalOpen(true);
        return;
      }
      await bookWithOptionalPackage(eligible[0]?.userPackageId);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : t("bookFailed");
      onError?.(message);
    } finally {
      setBusy(false);
    }
  }

  function closePackageModal(): void {
    if (!busy) {
      setPackageModalOpen(false);
    }
  }

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
          onBooked?.(bookingId);
        }}
        onError={(message) => onError?.(message)}
      />
    ) : null;

  return {
    busy,
    initiateBooking,
    packageModal,
  };
}
