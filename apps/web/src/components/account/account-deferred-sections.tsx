"use client";

import dynamic from "next/dynamic";
import { MemberPageContentSkeleton } from "@/components/account/member-page-content-skeleton";

function sectionFallback(rows = 3) {
  return function AccountDeferredSectionFallback() {
    return <MemberPageContentSkeleton rows={rows} />;
  };
}

export const UserClassesSectionDeferred = dynamic(
  () =>
    import("@/components/account/user-classes-section").then(
      (module) => module.UserClassesSection,
    ),
  { loading: sectionFallback(4) },
);

export const UserBookingsSectionDeferred = dynamic(
  () =>
    import("@/components/account/user-bookings-section").then(
      (module) => module.UserBookingsSection,
    ),
  { loading: sectionFallback(3) },
);

export const UserPackagesSectionDeferred = dynamic(
  () =>
    import("@/components/account/user-packages-section").then(
      (module) => module.UserPackagesSection,
    ),
  { loading: sectionFallback(2) },
);

export const UserWaitlistsSectionDeferred = dynamic(
  () =>
    import("@/components/account/user-waitlists-section").then(
      (module) => module.UserWaitlistsSection,
    ),
  { loading: sectionFallback(2) },
);

export const UserPaymentsHistoryDeferred = dynamic(
  () =>
    import("@/components/account/user-payments-history").then(
      (module) => module.UserPaymentsHistory,
    ),
  { loading: sectionFallback(3) },
);

export const NotificationPrefsFormDeferred = dynamic(
  () =>
    import("@/components/account/notification-prefs-form").then(
      (module) => module.NotificationPrefsForm,
    ),
  { loading: sectionFallback(1) },
);

export const UserGiftCardsBoardDeferred = dynamic(
  () =>
    import("@/components/account/user-gift-cards-board").then(
      (module) => module.UserGiftCardsBoard,
    ),
  { loading: sectionFallback(2) },
);
