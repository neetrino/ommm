import { formatDateCompactForUi } from "@/lib/date-display";
import { formatTimeForUiFromIso } from "@/lib/format-time-display";

/** Keep in sync with API `RETROACTIVE_SESSION_LOOKBACK_DAYS`. */
export const ADMIN_CLIENT_PAST_SESSION_LOOKBACK_DAYS = 30;

export type AdminClientAttachablePastSession = {
  id: string;
  startsAt: string;
  classType: { name: string };
  coach: { user: { name: string | null } };
  hasExistingVisit: boolean;
};

export type AdminClientAttachablePastSessionsResponse = {
  items: AdminClientAttachablePastSession[];
  lookbackDays: number;
};

export function pastSessionOptionLabel(
  session: AdminClientAttachablePastSession,
  locale: string,
  existingVisitLabel: string,
): string {
  const date = formatDateCompactForUi(session.startsAt);
  const time = formatTimeForUiFromIso(session.startsAt, locale);
  const coach = session.coach.user.name?.trim();
  const base =
    coach !== undefined && coach.length > 0
      ? `${date} ${time} · ${session.classType.name} · ${coach}`
      : `${date} ${time} · ${session.classType.name}`;
  if (!session.hasExistingVisit) {
    return base;
  }
  return `${base} · ${existingVisitLabel}`;
}

export function canSubmitPastSessionAttach(params: {
  sessionId: string;
  loading: boolean;
  loadError: string | null;
  submitting: boolean;
}): boolean {
  return (
    params.sessionId !== "" &&
    !params.loading &&
    params.loadError === null &&
    !params.submitting
  );
}
