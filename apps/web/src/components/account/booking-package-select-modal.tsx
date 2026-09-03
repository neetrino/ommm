"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { BookingPackageSelectGuestActions } from "@/components/account/booking-package-select-guest-actions";
import { BookingPackageSelectList } from "@/components/account/booking-package-select-list";
import {
  BookingPackageSelectMobileSheetLayout,
  BookingPackageSelectSheetCloseIcon,
} from "@/components/account/booking-package-select-sheet-chrome";
import { memberAccountHubSheetPanelStyle } from "@/components/account/member-account-hub-sheet-layout";
import { MemberHubMobileSheet } from "@/components/account/member-hub-mobile-sheet";
import {
  PACKAGE_SUBSCRIBE_DESKTOP_BACKDROP_CLASS,
  PACKAGE_SUBSCRIBE_DESKTOP_BODY_CLASS,
  PACKAGE_SUBSCRIBE_DESKTOP_MOTION_MS,
  PACKAGE_SUBSCRIBE_DESKTOP_OVERLAY_CLASS,
  PACKAGE_SUBSCRIBE_DESKTOP_PANEL_CLASS,
  PACKAGE_SUBSCRIBE_FORM_ACTIONS_CLASS,
  PACKAGE_SUBSCRIBE_FORM_CLASS,
  PACKAGE_SUBSCRIBE_FORM_SCROLL_CLASS,
  PACKAGE_SUBSCRIBE_SHEET_HEADER_CLASS,
  PACKAGE_SUBSCRIBE_SHEET_TITLE_CLASS,
} from "@/components/account/package-subscribe-payment-sheet-layout";
import sheetStyles from "@/components/account/package-subscribe-payment-sheet.module.css";
import formStyles from "@/components/account/package-subscribe-payment-form.module.css";
import { ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS } from "@/components/admin/admin-details-sheet-layout";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { useDesktopSheetEnterMotion } from "@/hooks/use-desktop-sheet-enter-motion";
import { useMemberHubSheetPhone } from "@/hooks/use-member-hub-sheet-phone";
import { ApiError, apiFetch } from "@/lib/api";
import { pickDefaultBookingPackageId } from "@/lib/booking-package-selection";
import { dismissMobileKeyboard } from "@/lib/dismiss-mobile-keyboard";
import type { EligibleBookingPackage } from "@/lib/eligible-booking-package";

export type { EligibleBookingPackage };

type BookingPackageSelectModalProps = {
  isOpen: boolean;
  sessionId: string;
  eligiblePackages: readonly EligibleBookingPackage[];
  locale: string;
  onClose: () => void;
  /** Opens the cancellation-policy modal; resolves true when the member confirms. */
  ensurePolicyAcknowledged?: () => Promise<boolean>;
  onBooked: (bookingId: string) => void;
  onError: (message: string) => void;
};

type BookSessionResponse = {
  id: string;
};

export function BookingPackageSelectModal({
  isOpen,
  sessionId,
  eligiblePackages,
  locale,
  onClose,
  ensurePolicyAcknowledged,
  onBooked,
  onError,
}: BookingPackageSelectModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <BookingPackageSelectModalSession
      sessionId={sessionId}
      eligiblePackages={eligiblePackages}
      locale={locale}
      onClose={onClose}
      ensurePolicyAcknowledged={ensurePolicyAcknowledged}
      onBooked={onBooked}
      onError={onError}
    />
  );
}

function BookingPackageSelectModalSession({
  sessionId,
  eligiblePackages,
  locale,
  onClose,
  ensurePolicyAcknowledged,
  onBooked,
  onError,
}: Omit<BookingPackageSelectModalProps, "isOpen">) {
  const t = useTranslations("forms.bookSession");
  const titleId = useId();
  const isPhone = useMemberHubSheetPhone();
  const { motionState: desktopMotionState, closeMotion: closeDesktopMotion } =
    useDesktopSheetEnterMotion(!isPhone);
  const [selectedId, setSelectedId] = useState<string>(
    pickDefaultBookingPackageId(eligiblePackages),
  );
  const [busy, setBusy] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [guestName, setGuestName] = useState("");
  const activeSelectedId = useMemo(() => {
    const selected = eligiblePackages.find((pkg) => pkg.userPackageId === selectedId);
    if (selected?.canBook || selected?.canBookGuest === true) {
      return selectedId;
    }
    return pickDefaultBookingPackageId(eligiblePackages);
  }, [eligiblePackages, selectedId]);
  const selectedPackage = eligiblePackages.find(
    (pkg) => pkg.userPackageId === activeSelectedId,
  );

  async function submitBooking(guestPassName?: string) {
    try {
      const body: { userPackageId: string; guestName?: string } = {
        userPackageId: activeSelectedId,
      };
      if (guestPassName !== undefined) {
        body.guestName = guestPassName;
      }
      const booking = await apiFetch<BookSessionResponse>(
        `/bookings/sessions/${sessionId}`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      );
      onBooked(booking.id);
      onClose();
    } catch (error) {
      onError(error instanceof ApiError ? error.message : t("bookFailed"));
    }
  }

  function requestSubmitBooking(guestPassName?: string): void {
    if (busy) {
      return;
    }
    void (async () => {
      setBusy(true);
      try {
        if (ensurePolicyAcknowledged) {
          const accepted = await ensurePolicyAcknowledged();
          if (!accepted) {
            return;
          }
        }
        await submitBooking(guestPassName);
      } finally {
        setBusy(false);
      }
    })();
  }

  function handleDesktopClose(): void {
    if (busy || isClosing) {
      return;
    }
    dismissMobileKeyboard();
    setIsClosing(true);
    closeDesktopMotion();
    window.setTimeout(onClose, PACKAGE_SUBSCRIBE_DESKTOP_MOTION_MS);
  }

  function renderSheetHeader(onCloseSheet: () => void): ReactNode {
    return (
      <header className={PACKAGE_SUBSCRIBE_SHEET_HEADER_CLASS}>
        <h2
          id={titleId}
          className={`${sheetStyles.sheetTitle} ${PACKAGE_SUBSCRIBE_SHEET_TITLE_CLASS}`}
        >
          {t("packageModalTitle")}
        </h2>
        <button
          type="button"
          className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
          aria-label={t("packageModalClose")}
          onClick={onCloseSheet}
          disabled={busy}
        >
          <BookingPackageSelectSheetCloseIcon />
        </button>
      </header>
    );
  }

  function renderSheetBody(onCloseSheet: () => void): ReactNode {
    return (
      <div className={PACKAGE_SUBSCRIBE_FORM_CLASS}>
        <div className={`${PACKAGE_SUBSCRIBE_FORM_SCROLL_CLASS} ${formStyles.formScroll}`}>
          <p className="text-sm leading-relaxed text-sage-600">
            {t("packageModalDescription")}
          </p>
          <BookingPackageSelectList
            eligiblePackages={eligiblePackages}
            activeSelectedId={activeSelectedId}
            locale={locale}
            busy={busy}
            onSelect={setSelectedId}
          />
          {selectedPackage?.canBookGuest === true ? (
            <label className="block text-sm text-sage-700">
              <span className="mb-1 block text-xs font-medium text-sage-500">
                {t("guestPassNameLabel")}
              </span>
              <input
                type="text"
                name="guestName"
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                className="w-full rounded-2xl border border-sand-200/80 bg-white px-3.5 py-2.5 text-sm text-sage-900"
                placeholder={t("guestPassNamePlaceholder")}
                disabled={busy}
              />
            </label>
          ) : null}
        </div>
        <div className={PACKAGE_SUBSCRIBE_FORM_ACTIONS_CLASS}>
          <BookingPackageSelectGuestActions
            busy={busy}
            showGuestAction={selectedPackage?.canBookGuest === true}
            canConfirmOwner={selectedPackage?.canBook === true}
            canConfirmGuest={
              selectedPackage?.canBookGuest === true && guestName.trim().length > 0
            }
            onClose={onCloseSheet}
            onConfirmOwner={() => {
              if (selectedPackage?.canBook === true && !busy) {
                requestSubmitBooking();
              }
            }}
            onConfirmGuest={() => {
              if (
                selectedPackage?.canBookGuest === true &&
                guestName.trim().length > 0 &&
                !busy
              ) {
                requestSubmitBooking(guestName.trim());
              }
            }}
          />
        </div>
      </div>
    );
  }

  if (isPhone) {
    return (
      <MemberHubMobileSheet
        bare
        titleId={titleId}
        closeLabel={t("packageModalClose")}
        backdropCloseLabel={t("packageModalClose")}
        onClose={onClose}
        closeDisabled={busy}
        panelStyle={memberAccountHubSheetPanelStyle()}
      >
        <BookingPackageSelectMobileSheetLayout
          renderHeader={renderSheetHeader}
          renderBody={renderSheetBody}
        />
      </MemberHubMobileSheet>
    );
  }

  return (
    <OmmDrawerPortal
      isOpen
      onClose={handleDesktopClose}
      backdropAriaLabel={t("packageModalClose")}
      ariaLabelledBy={titleId}
      closeDisabled={busy}
      overlayClassName={PACKAGE_SUBSCRIBE_DESKTOP_OVERLAY_CLASS}
      backdropClassName={PACKAGE_SUBSCRIBE_DESKTOP_BACKDROP_CLASS}
      panelClassName={PACKAGE_SUBSCRIBE_DESKTOP_PANEL_CLASS}
      motionState={desktopMotionState}
    >
      {renderSheetHeader(handleDesktopClose)}
      <div className={PACKAGE_SUBSCRIBE_DESKTOP_BODY_CLASS}>
        {renderSheetBody(handleDesktopClose)}
      </div>
    </OmmDrawerPortal>
  );
}
