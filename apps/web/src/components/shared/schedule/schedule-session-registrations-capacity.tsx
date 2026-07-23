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
};

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
      <ScheduleSessionCapacityIndicator
        booked={booked}
        capacity={capacity}
        spotsLabel={spotsLabel}
        secondaryLabel={secondaryLabel}
        onBookedCountClick={booked > 0 ? openModal : undefined}
        bookedCountAriaLabel={bookedCountAriaLabel}
      />
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
