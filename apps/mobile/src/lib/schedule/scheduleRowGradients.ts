/** Session row gradients — mobile viewport mapping from web home weekly schedule. */
const ROW_GRADIENTS = [
  ["#efe5a8", "#e2d672"],
  ["#e5f4f9", "#bbd2da"],
  ["#f6d0bd", "#cbc2b4"],
  ["#fcf6d6", "#ede9dd"],
  ["#ede9dd", "#cbc2b4"],
  ["#bbd2da", "#e5f4f9"],
] as const;

const CLASS_TYPE_GRADIENTS: Readonly<Record<string, readonly [string, string]>> = {
  yoga: ROW_GRADIENTS[0],
  pilates: ["#e5f4f9", "#bbd2da"],
  dances: ROW_GRADIENTS[2],
  dance: ROW_GRADIENTS[2],
};

/** Stable gradient colors for a schedule row background. */
export function resolveScheduleRowGradientColors(
  classType: string,
): readonly [string, string] {
  const normalized = classType.trim().toLowerCase();
  const mapped = CLASS_TYPE_GRADIENTS[normalized];
  if (mapped !== undefined) {
    return mapped;
  }

  if (normalized.length === 0) {
    return ROW_GRADIENTS[0];
  }

  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash + normalized.charCodeAt(index) * (index + 1)) % 9973;
  }

  return ROW_GRADIENTS[hash % ROW_GRADIENTS.length];
}
