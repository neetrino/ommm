import { ApiError, apiFetch } from "@/lib/api";
import {
  studioWallClockToUtc,
  utcToStudioCalendarDate,
  utcToStudioWallClockTime,
} from "@/lib/studio-timezone";

export function paidDateParts(confirmedAt: string | null): { date: string; time: string } {
  const instant = confirmedAt ? new Date(confirmedAt) : new Date();
  return {
    date: utcToStudioCalendarDate(instant),
    time: utcToStudioWallClockTime(instant),
  };
}

export async function savePaidDate(args: {
  paymentId: string;
  date: string;
  time: string;
  failedMessage: string;
  onSaved: (confirmedAt: string) => void;
  onError: (message: string) => void;
  setBusy: (busy: boolean) => void;
  dirtyRef: { current: boolean };
}): Promise<void> {
  const paidAt = draftPaidAtIso(args.date, args.time);
  if (!paidAt) {
    args.onError(args.failedMessage);
    return;
  }
  args.dirtyRef.current = false;
  args.setBusy(true);
  try {
    const confirmedAt = readConfirmedAt(
      await apiFetch<unknown>(`/payments/admin/${args.paymentId}/paid-at`, {
        method: "PATCH",
        body: JSON.stringify({ paidAt }),
      }),
    );
    if (!confirmedAt) {
      args.dirtyRef.current = true;
      args.onError(args.failedMessage);
      return;
    }
    args.onSaved(confirmedAt);
  } catch (error) {
    args.dirtyRef.current = true;
    args.onError(error instanceof ApiError ? error.message : args.failedMessage);
  } finally {
    args.setBusy(false);
  }
}

function draftPaidAtIso(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return null;
  }
  return studioWallClockToUtc(date, time).toISOString();
}

function readConfirmedAt(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("confirmedAt" in value)) {
    return null;
  }
  const confirmedAt = (value as { confirmedAt: unknown }).confirmedAt;
  return typeof confirmedAt === "string" ? confirmedAt : null;
}
