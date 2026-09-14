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
  bookedCountAriaLabel?: string;
  /** Compact text for week/month cards; ratio (`0/10`) for coach tables; default indicator for list rows. */
  layout?: "indicator" | "compactText" | "ratio";
  /** Admin/manager can add an existing client from the roster sheet. */
  canAdd?: boolean;
};

/** Compact week/month count — clickable without extra chrome. */
const COMPACT_SPOTS_BUTTON_CLASS = [
  "inline-flex max-w-full truncate text-left text-xs font-medium text-sage-700",
  "transition-colors hover:text-sage-950",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

/** Coach table count — `0/10`, clickable without the fill bar. */
const RATIO_SPOTS_BUTTON_CLASS = [
  "inline-flex font-semibold tabular-nums text-sage-900",
  "transition-colors hover:text-sage-700",
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
  bookedCountAriaLabel,
  layout = "indicator",
  canAdd = false,
}: ScheduleSessionRegistrationsCapacityProps) {
  const [modalOpen, setModalOpen] = useState(false);

  function openModal(event: MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    setModalOpen(true);
  }

  return (
    <>
      {layout === "indicator" ? (
        <ScheduleSessionCapacityIndicator
          booked={booked}
          capacity={capacity}
          spotsLabel={spotsLabel}
          onBookedCountClick={openModal}
          bookedCountAriaLabel={bookedCountAriaLabel}
        />
      ) : (
        <button
          type="button"
          className={layout === "ratio" ? RATIO_SPOTS_BUTTON_CLASS : COMPACT_SPOTS_BUTTON_CLASS}
          aria-label={bookedCountAriaLabel ?? spotsLabel}
          onClick={openModal}
        >
          {spotsLabel}
        </button>
      )}
      <AdminSessionRegistrationsModal
        isOpen={modalOpen}
        sessionId={sessionId}
        sessionTitle={sessionTitle}
        startsAt={startsAt}
        locale={locale}
        booked={booked}
        capacity={capacity}
        canAdd={canAdd}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
