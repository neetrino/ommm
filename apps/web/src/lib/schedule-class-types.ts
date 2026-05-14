export type ScheduleClassTypeLike = {
  classType: string;
};

export function getScheduleClassTypeValues(
  items: readonly ScheduleClassTypeLike[],
): string[] {
  const unique = new Set<string>();
  for (const item of items) {
    const value = item.classType.trim();
    if (value.length > 0) {
      unique.add(value);
    }
  }
  return [...unique].sort((a, b) => a.localeCompare(b));
}
