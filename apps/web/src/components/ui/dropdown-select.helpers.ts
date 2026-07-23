import { REDUCED_MOTION_MEDIA_QUERY } from "@/components/ui/dropdown-select.constants";

export function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches;
}

export function mergeClasses(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function isCharacterNavigationKey(event: React.KeyboardEvent<HTMLButtonElement>): boolean {
  return event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ";
}

export function optionLabelClassName(wrapLabel: boolean): string {
  return wrapLabel
    ? "min-w-0 flex-1 whitespace-normal break-words leading-snug"
    : "min-w-0 flex-1 truncate";
}
