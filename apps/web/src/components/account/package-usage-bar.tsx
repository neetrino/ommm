type PackageUsageBarSize = "md" | "sm";

type PackageUsageBarProps = {
  used: number;
  total: number;
  ariaLabel: string;
  size?: PackageUsageBarSize;
};

const BAR_WIDTH = 100;
const BAR_HEIGHT = 4;

const SIZE_CLASS: Record<PackageUsageBarSize, string> = {
  md: "h-2 w-full",
  sm: "h-1 w-full",
};

export function PackageUsageBar({
  used,
  total,
  ariaLabel,
  size = "md",
}: PackageUsageBarProps) {
  const clampedUsed = Math.max(0, Math.min(used, total));
  const fillWidth = total > 0 ? (clampedUsed / total) * BAR_WIDTH : 0;

  return (
    <svg
      viewBox={`0 0 ${BAR_WIDTH} ${BAR_HEIGHT}`}
      className={SIZE_CLASS[size]}
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
