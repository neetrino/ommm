type CoachAnalyticsKpiCellProps = {
  label: string;
  value: string;
};

const kpiCapsuleClass =
  "min-w-0 rounded-[20px] border border-white/60 bg-white/65 px-3 py-2.5 shadow-[0_8px_24px_-20px_rgba(45,40,35,0.2)] backdrop-blur-md";

function CoachAnalyticsKpiCell({ label, value }: CoachAnalyticsKpiCellProps) {
  return (
    <div className={kpiCapsuleClass}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-sage-500">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums leading-tight text-sage-900">{value}</p>
    </div>
  );
}

type CoachAnalyticsKpiHeroProps = {
  activityTitle: string;
  performanceTitle: string;
  activity: readonly CoachAnalyticsKpiCellProps[];
  performance: readonly CoachAnalyticsKpiCellProps[];
};

export function CoachAnalyticsKpiHero({
  activityTitle,
  performanceTitle,
  activity,
  performance,
}: CoachAnalyticsKpiHeroProps) {
  return (
    <section className="rounded-[24px] border border-white/50 bg-white/35 p-3 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)] backdrop-blur-md sm:p-4">
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        <div className="min-w-0 flex-1">
          <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wide text-sage-500">
            {activityTitle}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {activity.map((item) => (
              <CoachAnalyticsKpiCell key={item.label} {...item} />
            ))}
          </div>
        </div>

        <div
          className="my-4 h-px shrink-0 bg-gradient-to-r from-transparent via-sage-300/45 to-transparent lg:mx-5 lg:my-0 lg:h-auto lg:w-px lg:bg-gradient-to-b"
          aria-hidden
        />

        <div className="min-w-0 flex-1">
          <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wide text-sage-500">
            {performanceTitle}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {performance.map((item) => (
              <CoachAnalyticsKpiCell key={item.label} {...item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
