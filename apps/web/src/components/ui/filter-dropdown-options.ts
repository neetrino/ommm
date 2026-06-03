import type { DropdownOption } from "@/components/ui/dropdown-select";

export function filterDropdownOptions<T extends string>(
  options: readonly DropdownOption<T>[],
  query: string,
): DropdownOption<T>[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length === 0) {
    return [...options];
  }
  return options.filter((option) => option.label.toLowerCase().includes(trimmed));
}
