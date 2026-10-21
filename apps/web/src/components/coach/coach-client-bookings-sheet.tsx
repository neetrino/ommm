"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminDetailSheetTabBar } from "@/components/admin/admin-detail-sheet-tab-bar";
import { CoachClientBookingsHistory } from "@/components/coach/coach-client-bookings-history";
import { CoachClientPackagesPanel } from "@/components/coach/coach-client-packages-panel";
import {
  ADMIN_BOOKINGS_DETAILS_SHEET_PANEL_CLASS,
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { useAdminAnimatedSheetClose } from "@/components/admin/use-admin-animated-sheet-close";

const COACH_CLIENT_SHEET_TAB_PACKAGE = "package";
const COACH_CLIENT_SHEET_TAB_BOOKING = "booking";

type CoachClientSheetTab =
  | typeof COACH_CLIENT_SHEET_TAB_PACKAGE
  | typeof COACH_CLIENT_SHEET_TAB_BOOKING;

type CoachClientBookingsTarget = {
  id: string;
  name: string | null;
  lastName: string | null;
};

type CoachClientBookingsSheetProps = {
  client: CoachClientBookingsTarget | null;
  locale: string;
  onClose: () => void;
};

function coachClientDisplayName(
  client: Pick<CoachClientBookingsTarget, "name" | "lastName">,
  fallback: string,
): string {
  const label = [client.name, client.lastName]
    .filter((part): part is string => part !== null && part.trim().length > 0)
    .join(" ");
  return label.length > 0 ? label : fallback;
}

function parseCoachClientSheetTab(value: string): CoachClientSheetTab {
  if (value === COACH_CLIENT_SHEET_TAB_PACKAGE) {
    return COACH_CLIENT_SHEET_TAB_PACKAGE;
  }
  return COACH_CLIENT_SHEET_TAB_BOOKING;
}

/** Each time the sheet opens, Bookings is the selected tab. */
function useCoachClientSheetTab(isOpen: boolean) {
  const [activeTab, setActiveTab] = useState<CoachClientSheetTab>(
    COACH_CLIENT_SHEET_TAB_BOOKING,
  );
  const [wasOpen, setWasOpen] = useState(false);
  if (isOpen && !wasOpen) {
    setWasOpen(true);
    if (activeTab !== COACH_CLIENT_SHEET_TAB_BOOKING) {
      setActiveTab(COACH_CLIENT_SHEET_TAB_BOOKING);
    }
  } else if (!isOpen && wasOpen) {
    setWasOpen(false);
  }
  return [activeTab, setActiveTab] as const;
}

export function CoachClientBookingsSheet({
  client,
  locale,
  onClose,
}: CoachClientBookingsSheetProps) {
  if (client === null) {
    return null;
  }
  return (
    <CoachClientBookingsSheetContent
      key={client.id}
      client={client}
      locale={locale}
      onClose={onClose}
    />
  );
}

function CoachClientBookingsSheetContent({
  client,
  locale,
  onClose,
}: {
  client: CoachClientBookingsTarget;
  locale: string;
  onClose: () => void;
}) {
  const t = useTranslations("coachPages.clients");
  const tTabs = useTranslations("adminPages.clients.sheetTabs");
  const titleId = useId();
  const { isOpen, requestClose, onAfterClose } = useAdminAnimatedSheetClose(onClose);
  const [activeTab, setActiveTab] = useCoachClientSheetTab(isOpen);
  const name = coachClientDisplayName(client, t("unnamed"));

  return (
    <AdminSheetPortal
      presentation="drawer"
      isOpen={isOpen}
      onClose={requestClose}
      onAfterClose={onAfterClose}
      backdropAriaLabel={t("close")}
      ariaLabelledBy={titleId}
      drawerOverlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      drawerPanelClassName={ADMIN_BOOKINGS_DETAILS_SHEET_PANEL_CLASS}
    >
      <CoachClientSheetHeader
        titleId={titleId}
        name={name}
        closeLabel={t("close")}
        onClose={requestClose}
      />
      <CoachClientSheetSections
        client={client}
        locale={locale}
        activeTab={activeTab}
        tabsLabel={t("sheetTabs")}
        packageLabel={tTabs("packages")}
        bookingLabel={tTabs("bookings")}
        onTabChange={setActiveTab}
      />
    </AdminSheetPortal>
  );
}

function CoachClientSheetSections({
  client,
  locale,
  activeTab,
  tabsLabel,
  packageLabel,
  bookingLabel,
  onTabChange,
}: {
  client: CoachClientBookingsTarget;
  locale: string;
  activeTab: CoachClientSheetTab;
  tabsLabel: string;
  packageLabel: string;
  bookingLabel: string;
  onTabChange: (tab: CoachClientSheetTab) => void;
}) {
  return (
    <>
      <AdminDetailSheetTabBar
        tabs={[
          { value: COACH_CLIENT_SHEET_TAB_BOOKING, label: bookingLabel },
          { value: COACH_CLIENT_SHEET_TAB_PACKAGE, label: packageLabel },
        ]}
        activeTab={activeTab}
        onTabChange={(value) => onTabChange(parseCoachClientSheetTab(value))}
        density="snug"
        ariaLabel={tabsLabel}
      />
      <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
        {activeTab === COACH_CLIENT_SHEET_TAB_PACKAGE ? (
          <CoachClientPackagesPanel clientId={client.id} />
        ) : (
          <CoachClientBookingsHistory clientId={client.id} locale={locale} />
        )}
      </div>
    </>
  );
}

function CoachClientSheetHeader({
  titleId,
  name,
  closeLabel,
  onClose,
}: {
  titleId: string;
  name: string;
  closeLabel: string;
  onClose: () => void;
}) {
  return (
    <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
      <div className="flex items-start justify-between gap-3">
        <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
          {name}
        </h2>
        <button
          type="button"
          className={ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS}
          aria-label={closeLabel}
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </header>
  );
}
