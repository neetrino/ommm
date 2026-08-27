"use client";

import { useState, type MouseEvent } from "react";
import { AdminSessionRegistrationsModal } from "@/components/admin/admin-session-registrations-modal";
import { ScheduleSessionCapacityIndicator } from "@/components/shared/schedule/schedule-session-capacity-indicator";

type ScheduleSessionRegistrationsCapacityProps = {
  sessionId: string;
  sessionTitle: string;
  startsAt: string;
  locale: string;
  booked: number;
  capacity: number;
  spotsLabel: string;
  secondaryLabel: string;
  bookedCountAriaLabel?: string;
  /** Compact text for week/month cards; default indicator for list rows. */
  layout?: "indicator" | "compactText";
};

/** Compact week/month count — clickable without extra chrome. */
const COMPACT_SPOTS_BUTTON_CLASS = [
  "inline-flex max-w-full truncate text-left text-xs font-medium text-sage-700",
  "transition-colors hover:text-sage-950",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

export function ScheduleSessionRegistrationsCapacity({
  sessionId,
  sessionTitle,
  startsAt,
  locale,
  booked,
  capacity,
  spotsLabel,
  secondaryLabel,
  bookedCountAriaLabel,
  layout = "indicator",
}: ScheduleSessionRegistrationsCapacityProps) {
  const [modalOpen, setModalOpen] = useState(false);

  function openModal(event: MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    if (booked <= 0) {
      return;
    }
    setModalOpen(true);
  }

  return (
    <>
      {layout === "compactText" ? (
        booked > 0 ? (
          <button
            type="button"
            className={COMPACT_SPOTS_BUTTON_CLASS}
            aria-label={bookedCountAriaLabel ?? spotsLabel}
            onClick={openModal}
          >
            {spotsLabel}
          </button>
        ) : (
          <p className="truncate text-left text-xs font-medium text-sage-700">{spotsLabel}</p>
        )
      ) : (
        <ScheduleSessionCapacityIndicator
          booked={booked}
          capacity={capacity}
          spotsLabel={spotsLabel}
          secondaryLabel={secondaryLabel}
          onBookedCountClick={booked > 0 ? openModal : undefined}
          bookedCountAriaLabel={bookedCountAriaLabel}
        />
      )}
      <AdminSessionRegistrationsModal
        isOpen={modalOpen}
        sessionId={sessionId}
        sessionTitle={sessionTitle}
        startsAt={startsAt}
        locale={locale}
        booked={booked}
        capacity={capacity}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
