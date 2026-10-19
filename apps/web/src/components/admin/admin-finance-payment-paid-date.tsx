"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import { formatPaymentTime, toPaymentIso } from "@/components/account/user-payment-display";
import { AdminFinancePaymentDetailRow } from "@/components/admin/admin-finance-payment-details-rows";
import type { FinancePaymentItem } from "@/components/admin/admin-finance-types";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { isStudioManualPaymentMethod } from "@/lib/payment-confirmation";
import { paidDateParts, savePaidDate } from "@/components/admin/admin-finance-payment-paid-date.lib";

type PaidDateProps = {
  locale: string;
  payment: FinancePaymentItem;
  /** Admin-only. Managers see the paid date and cannot change it. */
  canEdit: boolean;
  onSaved: (confirmedAt: string) => void;
  onError: (message: string) => void;
};

export function AdminFinancePaymentPaidDate({
  locale,
  payment,
  canEdit,
  onSaved,
  onError,
}: PaidDateProps) {
  const editable =
    canEdit &&
    isStudioManualPaymentMethod(payment.paymentMethod) &&
    (payment.status === "PENDING" || payment.status === "SUCCEEDED");

  if (!editable) {
    return <PaidDateReadOnly locale={locale} confirmedAt={payment.confirmedAt} />;
  }

  return (
    <PaidDateEditor payment={payment} onSaved={onSaved} onError={onError} />
  );
}

function PaidDateReadOnly({
  locale,
  confirmedAt,
}: {
  locale: string;
  confirmedAt: string | null;
}) {
  const t = useTranslations("adminPages.finance.paymentDetails");
  return (
    <AdminFinancePaymentDetailRow
      label={t("paidDate")}
      value={
        confirmedAt ? (
          <PaidDateStamp locale={locale} iso={confirmedAt} />
        ) : (
          t("paidDateEmpty")
        )
      }
    />
  );
}

function PaidDateEditor({
  payment,
  onSaved,
  onError,
}: Omit<PaidDateProps, "canEdit" | "locale">) {
  const t = useTranslations("adminPages.finance.paymentDetails");
  const tActions = useTranslations("adminPages.finance.paymentActions");
  const draft = usePaidDateDraft(payment, onSaved, onError, tActions("actionFailed"));

  return (
    <AdminFinancePaymentDetailRow
      label={t("paidDate")}
      value={
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
      }
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
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <DatePickerInput
          name="payment-paid-date"
          ariaLabel={dateLabel}
          value={date}
          onChange={onDateChange}
          disabled={busy}
          allowManualEntry
        />
        <input
          type="time"
          name="payment-paid-time"
          aria-label={timeLabel}
          value={time}
          disabled={busy}
          onChange={(event) => onTimeChange(event.target.value)}
          className="ommm-input"
        />
      </div>
      <p className="text-xs text-sage-500">{hint}</p>
      {pending ? null : (
        <button
          type="button"
          className="ommm-btn-compact-primary"
          disabled={busy || !dirty}
          onClick={onSave}
        >
          {saveLabel}
        </button>
      )}
    </div>
  );
}

function PaidDateStamp({ locale, iso }: { locale: string; iso: string }) {
  const paidAtIso = toPaymentIso(iso);
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <SessionDateTimeHighlight
        locale={locale}
        startsAt={paidAtIso}
        endsAt={paidAtIso}
        variant="listDateYear"
      />
      <span className="text-sm text-sage-700">{formatPaymentTime(iso, locale)}</span>
    </span>
  );
}

