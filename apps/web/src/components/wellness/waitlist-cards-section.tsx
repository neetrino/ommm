import {
  WAITLIST_TONE_CARD,
  WAITLIST_TONE_META,
  WAITLIST_TONE_SUB,
  WAITLIST_TONE_TITLE,
  type WaitlistTone,
} from "./waitlist-tone";

export type WaitlistCardItem = {
  id: string;
  spotLabel: string;
  title: string;
  timeLine: string;
  tone: WaitlistTone;
};

export type WaitlistCardsSectionProps = {
  title: string;
  lead: string;
  emptyMessage?: string;
  items: WaitlistCardItem[];
  /**
   * When true, skips outer wellness shell (use inside a parent that already
   * provides `ommm-bg-wellness` so the gradient is continuous).
   */
  embedded?: boolean;
};

export function WaitlistCardsSection({
  title,
  lead,
  emptyMessage,
  items,
  embedded = false,
}: WaitlistCardsSectionProps) {
  const inner = (
    <div className="relative w-full">
        <header className="mb-8 flex items-end justify-between gap-6 sm:mb-10">
          <h2 className="ommm-h2">{title}</h2>
          <p className="hidden max-w-md text-sm text-sage-500 sm:block">{lead}</p>
        </header>

        {items.length === 0 ? (
          <p className="rounded-[28px] border border-white/55 bg-gradient-to-br from-cream-100/50 via-peach-100/35 to-blue-100/45 px-6 py-8 text-sm text-sage-700 backdrop-blur-md ring-1 ring-white/40">
            {emptyMessage ?? lead}
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((entry) => (
              <li
                key={entry.id}
                className={`flex flex-col gap-2 p-7 backdrop-blur-md transition-transform hover:-translate-y-0.5 ${WAITLIST_TONE_CARD[entry.tone]}`}
              >
                <p
                  className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${WAITLIST_TONE_META[entry.tone]}`}
                >
                  {entry.spotLabel}
                </p>
                <p
                  className={`text-lg font-semibold leading-tight ${WAITLIST_TONE_TITLE[entry.tone]}`}
                >
                  {entry.title}
                </p>
                <p className={`text-xs ${WAITLIST_TONE_SUB[entry.tone]}`}>
                  {entry.timeLine}
                </p>
              </li>
            ))}
          </ul>
        )}
    </div>
  );

  if (embedded) {
    return inner;
  }

  return (
    <section className="ommm-bg-wellness relative -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
      >
        <div className="absolute left-1/3 top-1/3 h-72 w-72 rounded-full bg-peach-100/50 blur-3xl" />
      </div>
      <div className="relative w-full ommm-section">{inner}</div>
    </section>
  );
}
