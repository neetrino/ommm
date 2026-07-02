"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type {
  AdminBookingRow,
  AdminBookingSessionSlot,
} from "@/components/admin/admin-bookings-query";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import { OmmFilterDropdown } from "@/components/ui/omm-select-dropdown";
import { apiFetch } from "@/lib/api";
import { formatDateTimeForUi } from "@/lib/date-display";

type AdminBookingsMoveDialogProps = {
  booking: AdminBookingRow;
  onClose: () => void;
  onSubmit: (targetSessionId: string) => void;
};

type MoveSessionOption = {
  id: string;
  startsAt: string;
  classType: { name: string };
  coach: { user: { name: string | null } };
};

export function AdminBookingsMoveDialog({
  booking,
  onClose,
  onSubmit,
}: AdminBookingsMoveDialogProps) {
  const t = useTranslations("adminPages.bookings");
  const [targetSessionId, setTargetSessionId] = useState("");
  const [options, setOptions] = useState<MoveSessionOption[]>([]);

  useEffect(() => {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 30);
    const q = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}&typeId=${encodeURIComponent(booking.session.classType.id)}`;
    void apiFetch(`/classes/admin/sessions?${q}`)
      .then((payload) =>
        setOptions(
          (
            payload as Array<{
              id: string;
              startsAt: string;
              status: AdminBookingSessionSlot["status"];
              classType: { name: string };
              coach: { user: { name: string | null } };
            }>
          )
            .filter(
              (row) =>
                row.id !== booking.session.id &&
                row.status !== "CANCELLED" &&
                row.status !== "DRAFT",
            )
            .map((row) => ({
              id: row.id,
              startsAt: row.startsAt,
              classType: row.classType,
              coach: { user: { name: row.coach.user.name } },
            })),
        ),
      )
      .catch(() => setOptions([]));
  }, [booking.session.classType.id, booking.session.id]);

  const slotOptions = options.map((row) => ({
    value: row.id,
    label: `${formatDateTimeForUi(row.startsAt)} · ${row.classType.name} · ${row.coach.user.name ?? "—"}`,
  }));

  return (
    <OmmModalPortal
      isOpen
      onClose={onClose}
      backdropAriaLabel={t("close")}
      overlayClassName="ommm-modal-overlay z-[110] items-center p-4"
      panelClassName="w-full max-w-lg rounded-2xl border border-white/60 bg-white p-4"
    >
      <h3 className="text-base font-semibold text-sage-900">{t("actionMove")}</h3>
      <p className="mt-1 text-sm text-sage-600">
        {booking.user.name ?? booking.user.email} · {booking.session.classType.name}
      </p>
      <div className="mt-3">
        <OmmFilterDropdown
          allValue=""
          value={targetSessionId}
          ariaLabel={t("selectClassSlot")}
          allLabel={t("selectClassSlot")}
          onChange={setTargetSessionId}
          options={slotOptions}
          disabled={slotOptions.length === 0}
        />
      </div>
      {options.length === 0 ? (
        <p className="mt-2 text-xs text-sage-500">{t("emptyMoveOptions")}</p>
      ) : null}
      <div className="mt-4 flex justify-end gap-2">
        <OmmButton size="sm" variant="ghost" onClick={onClose}>
          {t("close")}
        </OmmButton>
        <OmmButton
          size="sm"
          variant="primary"
          disabled={targetSessionId === ""}
          onClick={() => onSubmit(targetSessionId)}
        >
          {t("actionMove")}
        </OmmButton>
      </div>
    </OmmModalPortal>
  );
}
