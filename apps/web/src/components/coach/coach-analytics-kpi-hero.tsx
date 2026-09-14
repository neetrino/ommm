type CoachAnalyticsKpiCellProps = {
  label: string;
  value: string;
};

const kpiCapsuleClass = [
  "flex h-full min-w-0 flex-col overflow-hidden rounded-[20px]",
  "border border-white/60 bg-white/65 px-3 py-2.5",
  "shadow-[0_8px_24px_-20px_rgba(45,40,35,0.2)] backdrop-blur-md",
].join(" ");

function CoachAnalyticsKpiCell({ label, value }: CoachAnalyticsKpiCellProps) {
  return (
    <div className={kpiCapsuleClass}>
      <p className="text-[11px] font-medium uppercase leading-snug tracking-wide text-sage-500 [overflow-wrap:anywhere]">
        {label}
      </p>
      <p className="mt-1 truncate text-lg font-semibold tabular-nums leading-tight text-sage-900">
        {value}
      </p>
    </div>
  );
}

type CoachAnalyticsKpiHeroProps = {
  activityTitle: string;
  performanceTitle: string;
  activity: readonly CoachAnalyticsKpiCellProps[];
  performance: readonly CoachAnalyticsKpiCellProps[];
};

function KpiGroup({
  title,
  items,
}: {
  title: string;
  items: readonly CoachAnalyticsKpiCellProps[];
}) {
  return (
    <div className="min-w-0">
      <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wide text-sage-500">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={[
              "min-w-0",
              index === items.length - 1 ? "col-span-2 sm:col-span-1" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <CoachAnalyticsKpiCell {...item} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CoachAnalyticsKpiHero({
  activityTitle,
  performanceTitle,
  activity,
  performance,
}: CoachAnalyticsKpiHeroProps) {
  return (
    <section className="w-full min-w-0 overflow-hidden rounded-[24px] border border-white/50 bg-white/35 p-3 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)] backdrop-blur-md sm:p-4">
      <div className="grid w-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:items-stretch lg:gap-x-5">
        <KpiGroup title={activityTitle} items={activity} />

        <div
          className="h-px bg-gradient-to-r from-transparent via-sage-300/45 to-transparent lg:h-auto lg:w-full lg:self-stretch lg:bg-gradient-to-b"
          aria-hidden
        />

        <KpiGroup title={performanceTitle} items={performance} />
      </div>
    </section>
  );
}
