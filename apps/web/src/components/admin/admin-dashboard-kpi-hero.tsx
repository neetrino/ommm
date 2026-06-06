type AdminDashboardKpiCellProps = {
  label: string;
  value: string;
  hint?: string;
  valueTone?: "default" | "positive" | "negative";
};

const kpiCapsuleClass =
  "min-w-0 rounded-[20px] border border-white/60 bg-white/65 px-3 py-2.5 shadow-[0_8px_24px_-20px_rgba(45,40,35,0.2)] backdrop-blur-md";

const kpiValueToneClass = {
  default: "text-sage-900",
  positive: "text-emerald-700",
  negative: "text-red-700",
} as const;

function AdminDashboardKpiCell({ label, value, hint, valueTone = "default" }: AdminDashboardKpiCellProps) {
  return (
    <div className={kpiCapsuleClass}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-sage-500">{label}</p>
      <p
        className={`mt-1 text-lg font-semibold tabular-nums leading-tight ${kpiValueToneClass[valueTone]}`}
      >
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] text-sage-500">{hint}</p> : null}
    </div>
  );
}

type AdminDashboardKpiHeroProps = {
  operationsTitle: string;
  financeTitle: string;
  operations: readonly AdminDashboardKpiCellProps[];
  finance: readonly AdminDashboardKpiCellProps[];
};

export function AdminDashboardKpiHero({
  operationsTitle,
  financeTitle,
  operations,
  finance,
}: AdminDashboardKpiHeroProps) {
  return (
    <section className="rounded-[24px] border border-white/50 bg-white/35 p-3 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)] backdrop-blur-md sm:p-4">
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        <div className="min-w-0 flex-1">
          <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wide text-sage-500">
            {operationsTitle}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {operations.map((item) => (
              <AdminDashboardKpiCell key={item.label} {...item} />
            ))}
          </div>
        </div>

        <div
          className="my-4 h-px shrink-0 bg-gradient-to-r from-transparent via-sage-300/45 to-transparent lg:mx-5 lg:my-0 lg:h-auto lg:w-px lg:bg-gradient-to-b"
          aria-hidden
        />

        <div className="min-w-0 flex-1 lg:max-w-[22rem] xl:max-w-none">
          <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wide text-sage-500">
            {financeTitle}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {finance.map((item) => (
              <AdminDashboardKpiCell key={item.label} {...item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
