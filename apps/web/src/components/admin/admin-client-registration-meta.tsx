import type { ClientRow } from "@/components/admin/admin-clients-types";
import { DatePickerCalendarGlyph } from "@/components/ui/date-picker-icons";
import { clientRegistrationSourceLabel } from "@/components/admin/admin-client-registration-source";
import { formatDateForUi } from "@/lib/date-display";

type ClientRegistrationMetaProps = {
  createdAt: string;
  registrationSource: ClientRow["registrationSource"];
  registeredBy: ClientRow["registeredBy"];
  registeredLabel: string;
  sourceLabel: string;
  labels: {
    self: string;
    byAdmin: string;
    byManager: string;
    byStaff: string;
  };
};

const SOURCE_BADGE_BASE_CLASS =
  "mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide";

function sourceBadgeClass(
  registrationSource: ClientRow["registrationSource"],
  role: NonNullable<ClientRow["registeredBy"]>["role"] | undefined,
): string {
  if (registrationSource === "SELF") {
    return `${SOURCE_BADGE_BASE_CLASS} bg-mint-100 text-sage-800 ring-1 ring-mint-200/70`;
  }
  if (role === "ADMIN") {
    return `${SOURCE_BADGE_BASE_CLASS} bg-sand-100 text-sage-900 ring-1 ring-sand-200/80`;
  }
  if (role === "MANAGER") {
    return `${SOURCE_BADGE_BASE_CLASS} bg-white text-sage-800 shadow-sm ring-1 ring-sage-300/70`;
  }
  return `${SOURCE_BADGE_BASE_CLASS} bg-sage-100 text-sage-800 ring-1 ring-sage-200/80`;
}

function SourceGlyph({
  registrationSource,
}: {
  registrationSource: ClientRow["registrationSource"];
}) {
  if (registrationSource === "SELF") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
        <path
          d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M4.5 20.2c1.7-3.2 4.4-4.7 7.5-4.7s5.8 1.5 7.5 4.7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path
        d="M16 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 13a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M2.8 20.2c1.2-2.6 3.3-3.9 5.7-3.9 1.4 0 2.6.5 3.5 1.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12.2 17.2c.9-.7 2-1 3.3-1 2.5 0 4.6 1.3 5.7 3.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Standalone profile card: registration date + source badge.
 */
export function ClientRegistrationMeta({
  createdAt,
  registrationSource,
  registeredBy,
  registeredLabel,
  sourceLabel,
  labels,
}: ClientRegistrationMetaProps) {
  const sourceText = clientRegistrationSourceLabel({
    registrationSource,
    registeredBy,
    labels,
  });
  const badgeClass = sourceBadgeClass(registrationSource, registeredBy?.role);
  const creatorName = registeredBy?.name?.trim() ?? "";

  return (
    <section
      className="rounded-2xl border border-white/60 bg-white/60 p-3 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-4"
      aria-label={`${registeredLabel}, ${sourceLabel}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sage-500">
            {registeredLabel}
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium tabular-nums text-sage-900">
            <DatePickerCalendarGlyph className="h-3.5 w-3.5 shrink-0 text-sage-500" />
            {formatDateForUi(createdAt)}
          </p>
        </div>

        <div className="min-w-0 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sage-500">
            {sourceLabel}
          </p>
          <span className={badgeClass}>
            <SourceGlyph registrationSource={registrationSource} />
            {sourceText}
          </span>
          {creatorName.length > 0 && registrationSource === "STAFF" ? (
            <p className="mt-1.5 truncate text-[11px] text-sage-500">{creatorName}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
