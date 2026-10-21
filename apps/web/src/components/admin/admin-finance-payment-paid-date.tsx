"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  DETAILS_INPUT_CLASS,
  DetailsFieldRow,
  DetailsFloatingLabel,
} from "@/components/shared/details/details-card";
import type { FinancePaymentItem } from "@/components/admin/admin-finance-types";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmButton } from "@/components/ui/omm-button";
import { isStudioManualPaymentMethod } from "@/lib/payment-confirmation";
import { paidDateParts, savePaidDate } from "@/components/admin/admin-finance-payment-paid-date.lib";

type PaidDateProps = {
  payment: FinancePaymentItem;
  onSaved: (confirmedAt: string) => void;
  onError: (message: string) => void;
};

/** Admin-only, cash/terminal payments that are pending or paid. */
export function isPaidDateEditable(payment: FinancePaymentItem, canEdit: boolean): boolean {
  return (
    canEdit &&
    isStudioManualPaymentMethod(payment.paymentMethod) &&
    (payment.status === "PENDING" || payment.status === "SUCCEEDED")
  );
}

/** Paid date + time editor. Render only when {@link isPaidDateEditable} is true. */
export function AdminFinancePaymentPaidDate({ payment, onSaved, onError }: PaidDateProps) {
  const t = useTranslations("adminPages.finance.paymentDetails");
  const tActions = useTranslations("adminPages.finance.paymentActions");
  const draft = usePaidDateDraft(payment, onSaved, onError, tActions("actionFailed"));

  return (
    <PaidDateFields
      date={draft.date}
      time={draft.time}
      busy={draft.busy}
      dirty={draft.dirty}
      pending={payment.status === "PENDING"}
      dateLabel={t("paidDate")}
      timeLabel={t("paidTime")}
      hint={payment.status === "PENDING" ? t("paidDatePendingHint") : t("paidDateHint")}
      saveLabel={draft.busy ? t("paidDateSaving") : t("paidDateSave")}
      onDateChange={draft.changeDate}
      onTimeChange={draft.changeTime}
      onSave={draft.save}
    />
  );
}

function usePaidDateDraft(
  payment: FinancePaymentItem,
  onSaved: (confirmedAt: string) => void,
  onError: (message: string) => void,
  failedMessage: string,
) {
  const initial = paidDateParts(payment.confirmedAt);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [busy, setBusy] = useState(false);
  const dirtyRef = useRef(false);
  const baseline = paidDateParts(payment.confirmedAt);
  useSyncPaidDateParts(payment, dirtyRef, setDate, setTime);

  const save = () => {
    void savePaidDate({
      paymentId: payment.id,
      date,
      time,
      failedMessage,
      onSaved,
      onError,
      setBusy,
      dirtyRef,
    });
  };

  useEffect(() => {
    if (payment.status !== "SUCCEEDED" || !dirtyRef.current) {
      return;
    }
    save();
    // Save the draft chosen before the payment was marked succeeded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment.id, payment.status]);

  return {
    date,
    time,
    busy,
    save,
    dirty: date !== baseline.date || time !== baseline.time,
    changeDate: (next: string) => markPaidDraft(dirtyRef, setDate, next),
    changeTime: (next: string) => markPaidDraft(dirtyRef, setTime, next),
  };
}

function markPaidDraft(
  dirtyRef: { current: boolean },
  setValue: (value: string) => void,
  next: string,
): void {
  dirtyRef.current = true;
  setValue(next);
}

function useSyncPaidDateParts(
  payment: FinancePaymentItem,
  dirtyRef: { current: boolean },
  setDate: (value: string) => void,
  setTime: (value: string) => void,
): void {
  const confirmedAt = payment.confirmedAt;
  const paymentId = payment.id;

  useEffect(() => {
    const parts = paidDateParts(confirmedAt);
    setDate(parts.date);
    setTime(parts.time);
    dirtyRef.current = false;
    // Reset only when another payment is opened. confirmedAt is read for that row.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  useEffect(() => {
    if (dirtyRef.current) {
      return;
    }
    const parts = paidDateParts(confirmedAt);
    setDate(parts.date);
    setTime(parts.time);
  }, [confirmedAt, dirtyRef, setDate, setTime]);
}

function PaidDateFields({
  date,
  time,
  busy,
  dirty,
  pending,
  dateLabel,
  timeLabel,
  hint,
  saveLabel,
  onDateChange,
  onTimeChange,
  onSave,
}: {
  date: string;
  time: string;
  busy: boolean;
  dirty: boolean;
  pending: boolean;
  dateLabel: string;
  timeLabel: string;
  hint: string;
  saveLabel: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-3">
      <DetailsFieldRow>
        <DetailsFloatingLabel label={dateLabel}>
          <DatePickerInput
            name="payment-paid-date"
            ariaLabel={dateLabel}
            value={date}
            onChange={onDateChange}
            disabled={busy}
            allowManualEntry
            containerClassName={DETAILS_INPUT_CLASS}
          />
        </DetailsFloatingLabel>
        <DetailsFloatingLabel label={timeLabel}>
          <input
            type="time"
            name="payment-paid-time"
            aria-label={timeLabel}
            value={time}
            disabled={busy}
            onChange={(event) => onTimeChange(event.target.value)}
            className={`ommm-input ${DETAILS_INPUT_CLASS}`}
          />
        </DetailsFloatingLabel>
      </DetailsFieldRow>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 flex-1 text-xs text-sage-500">{hint}</p>
        {pending ? null : (
          <OmmButton type="button" size="sm" disabled={busy || !dirty} onClick={onSave}>
            {saveLabel}
          </OmmButton>
        )}
      </div>
    </div>
  );
}

