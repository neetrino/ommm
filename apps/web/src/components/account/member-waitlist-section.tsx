import { memberChrome } from "@/components/account/member-chrome";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { SessionCoachLine } from "@/components/account/session-coach-line";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";

export type MemberWaitlistItem = {
  id: string;
  spotLabel: string;
  title: string;
  startsAt: string;
  endsAt: string;
  coachName: string | null;
};

export type MemberWaitlistSectionProps = {
  locale: string;
  title: string;
  lead: string;
  emptyMessage?: string;
  items: MemberWaitlistItem[];
};

export function MemberWaitlistSection({
  locale,
  title,
  lead,
  emptyMessage,
  items,
}: MemberWaitlistSectionProps) {
  return (
    <div className="relative w-full">
      <header className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <h2 className={memberChrome.sectionTitle}>{title}</h2>
        <p className="max-w-md text-sm text-sage-500">{lead}</p>
      </header>

      {items.length === 0 ? (
        <p className={memberChrome.emptyState}>{emptyMessage ?? lead}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((entry) => (
            <li key={entry.id} className={memberChrome.waitlistCard}>
              <span className={`${memberChrome.statusPill} self-start`}>
                {entry.spotLabel}
              </span>
              <SessionClassTitle variant="list" name={entry.title} />
              <div className="flex items-center gap-3">
                <SessionDateTimeHighlight
                  locale={locale}
                  startsAt={entry.startsAt}
                  endsAt={entry.endsAt}
                  variant="listDate"
                />
                <SessionDateTimeHighlight
                  locale={locale}
                  startsAt={entry.startsAt}
                  endsAt={entry.endsAt}
                  variant="listTime"
                />
              </div>
              <SessionCoachLine coachName={entry.coachName} variant="list" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
