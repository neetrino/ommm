"use client";

import {
  BookingPackageSelectModal,
  type EligibleBookingPackage,
} from "@/components/account/booking-package-select-modal";
import {
  BookingPackagePurchaseModal,
} from "@/components/account/booking-package-purchase-modal";
import type { PackageSubscribePlanOption } from "@/lib/package-subscribe-plan-option";
import {
  clearBookPackageSessionQuery,
  clearBuyPackageSessionQuery,
} from "@/lib/book-package-session-url";

type SessionBookingModalsProps = {
  locale: string;
  sessionId: string;
  packageModalOpen: boolean;
  purchaseModalOpen: boolean;
  eligiblePackages: readonly EligibleBookingPackage[];
  purchasePlans: readonly PackageSubscribePlanOption[];
  suggestedPlanId: string | undefined;
  onClosePackageModal: () => void;
  onClosePurchaseModal: () => void;
  onBooked: (bookingId: string) => void;
  onError: (message: string) => void;
  replaceSearchParams: (mutate: (params: URLSearchParams) => void) => void;
};

export function SessionBookingModals({
  locale,
  sessionId,
  packageModalOpen,
  purchaseModalOpen,
  eligiblePackages,
  purchasePlans,
  suggestedPlanId,
  onClosePackageModal,
  onClosePurchaseModal,
  onBooked,
  onError,
  replaceSearchParams,
}: SessionBookingModalsProps) {
  const packageModal =
    packageModalOpen ? (
      <BookingPackageSelectModal
        isOpen={packageModalOpen}
        sessionId={sessionId}
        eligiblePackages={eligiblePackages}
        locale={locale}
        onClose={onClosePackageModal}
        onBooked={(bookingId) => {
          replaceSearchParams(clearBookPackageSessionQuery);
          onBooked(bookingId);
        }}
        onError={onError}
      />
    ) : null;

  const purchaseModal =
    purchaseModalOpen && purchasePlans.length > 0 ? (
      <BookingPackagePurchaseModal
        isOpen={purchaseModalOpen}
        locale={locale}
        plans={purchasePlans}
        initialPlanId={suggestedPlanId}
        onClose={onClosePurchaseModal}
      />
    ) : null;

  return (
    <>
      {packageModal}
      {purchaseModal}
    </>
  );
}

export { clearBookPackageSessionQuery, clearBuyPackageSessionQuery };
