type PackageUsageBarProps = {
  used: number;
  total: number;
  ariaLabel: string;
};

const BAR_WIDTH = 100;
const BAR_HEIGHT = 4;

export function PackageUsageBar({ used, total, ariaLabel }: PackageUsageBarProps) {
  const clampedUsed = Math.max(0, Math.min(used, total));
  const fillWidth = total > 0 ? (clampedUsed / total) * BAR_WIDTH : 0;

  return (
    <svg
      viewBox={`0 0 ${BAR_WIDTH} ${BAR_HEIGHT}`}
      className="h-2 w-full"
      role="progressbar"
      aria-valuenow={clampedUsed}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={ariaLabel}
      preserveAspectRatio="none"
    >
      <rect
        x={0}
        y={0}
        width={BAR_WIDTH}
        height={BAR_HEIGHT}
        className="fill-sand-100"
        rx={BAR_HEIGHT / 2}
      />
      <rect
        x={0}
        y={0}
        width={fillWidth}
        height={BAR_HEIGHT}
        className="fill-sage-600"
        rx={BAR_HEIGHT / 2}
      />
    </svg>
  );
}
