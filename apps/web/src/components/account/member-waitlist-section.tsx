import { memberChrome } from "@/components/account/member-chrome";

export type MemberWaitlistItem = {
  id: string;
  spotLabel: string;
  title: string;
  timeLine: string;
};

export type MemberWaitlistSectionProps = {
  title: string;
  lead: string;
  emptyMessage?: string;
  items: MemberWaitlistItem[];
};

export function MemberWaitlistSection({
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
              <p className={memberChrome.cardMeta}>{entry.spotLabel}</p>
              <p className={memberChrome.cardTitle}>{entry.title}</p>
              <p className={memberChrome.cardSub}>{entry.timeLine}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
