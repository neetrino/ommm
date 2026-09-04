import type { ReactNode } from "react";
import type { ClientRow } from "@/components/admin/admin-clients-types";
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

const CARD_CLASS =
  "overflow-hidden rounded-2xl border border-sand-200/70 bg-gradient-to-br from-white/90 via-sand-50/40 to-mint-50/30 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md";

const LABEL_CLASS =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-sage-500";

const ICON_WELL_CLASS =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sand-200/80 bg-gradient-to-b from-white to-sand-50 text-sand-700 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.95),0_6px_16px_-12px_rgba(45,40,35,0.2)]";

type SourceTone = "self" | "admin" | "manager" | "staff";

function resolveSourceTone(
  registrationSource: ClientRow["registrationSource"],
  role: NonNullable<ClientRow["registeredBy"]>["role"] | undefined,
): SourceTone {
  if (registrationSource === "SELF") {
    return "self";
  }
  if (role === "ADMIN") {
    return "admin";
  }
  if (role === "MANAGER") {
    return "manager";
  }
  return "staff";
}

function sourceBadgeClass(tone: SourceTone): string {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide";
  if (tone === "self") {
    return `${base} border border-mint-200/80 bg-mint-100/90 text-sage-800`;
  }
  if (tone === "admin") {
    return `${base} border border-sand-300/80 bg-sand-100 text-sage-900`;
  }
  if (tone === "manager") {
    return `${base} border border-sage-300/70 bg-white text-sage-800 shadow-sm`;
  }
  return `${base} border border-sage-200/80 bg-sage-100/90 text-sage-800`;
}

function creatorInitials(name: string): string {
  const parts = name.split(/\s+/).filter((part) => part.length > 0);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function CalendarGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="15"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M3.5 10h17" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M8 3.5v4M16 3.5v4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SourceGlyph({ tone }: { tone: SourceTone }) {
  if (tone === "self") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M4.5 20.2c1.7-3.2 4.4-4.7 7.5-4.7s5.8 1.5 7.5 4.7"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 13a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M2.8 20.2c1.2-2.6 3.3-3.9 5.7-3.9 1.4 0 2.6.5 3.5 1.3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M12.2 17.2c.9-.7 2-1 3.3-1 2.5 0 4.6 1.3 5.7 3.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MetaTile({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
      <div className={ICON_WELL_CLASS}>{icon}</div>
      <div className="min-w-0 pt-0.5">
        <p className={LABEL_CLASS}>{label}</p>
        <div className="mt-1.5">{children}</div>
      </div>
    </div>
  );
}

/**
 * Standalone profile card: registration date + source, design-system aligned.
 */
export function ClientRegistrationMeta({
  createdAt,
  registrationSource,
  registeredBy,
  registeredLabel,
  sourceLabel,
  labels,
}: ClientRegistrationMetaProps) {
  const tone = resolveSourceTone(registrationSource, registeredBy?.role);
  const sourceText = clientRegistrationSourceLabel({
    registrationSource,
    registeredBy,
    labels,
  });
  const creatorName = registeredBy?.name?.trim() ?? "";
  const showCreator = creatorName.length > 0 && registrationSource === "STAFF";

  return (
    <section className={CARD_CLASS} aria-label={`${registeredLabel}, ${sourceLabel}`}>
      <div
        className="pointer-events-none h-px bg-gradient-to-r from-transparent via-sand-300/70 to-transparent"
        aria-hidden
      />
      <div className="grid sm:grid-cols-2 sm:divide-x sm:divide-sand-200/70">
        <MetaTile label={registeredLabel} icon={<CalendarGlyph />}>
          <p className="font-serif text-lg leading-none tracking-tight text-sage-950 tabular-nums sm:text-xl">
            {formatDateForUi(createdAt)}
          </p>
        </MetaTile>

        <MetaTile label={sourceLabel} icon={<SourceGlyph tone={tone} />}>
          <span className={sourceBadgeClass(tone)}>{sourceText}</span>
          {showCreator ? (
            <div className="mt-2.5 flex min-w-0 items-center gap-2">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sand-700 text-[10px] font-semibold text-cream-50 ring-2 ring-white">
                {creatorInitials(creatorName)}
              </span>
              <p className="truncate text-sm font-medium text-sage-800">{creatorName}</p>
            </div>
          ) : null}
        </MetaTile>
      </div>
    </section>
  );
}
