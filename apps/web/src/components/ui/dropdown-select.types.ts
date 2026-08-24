import type { ReactNode } from "react";
import type { FloatingMenuAlign } from "@/components/ui/use-floating-menu-position";

export type DropdownOption<T extends string> = {
  value: T;
  label: string;
};

export type DropdownSelectProps<T extends string> = {
  label: string;
  ariaLabel: string;
  value: T;
  options: readonly DropdownOption<T>[];
  onChange: (value: T) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  /** When true, label text wraps instead of truncating with ellipsis. */
  wrapLabel?: boolean;
  /**
   * When true, menu option labels wrap (full text visible).
   * Defaults to `wrapLabel` when omitted.
   */
  wrapMenuLabel?: boolean;
  /**
   * When set, clicking the already-selected option clears to this value
   * (1st click selects, 2nd click deselects).
   */
  toggleDeselectValue?: T;
  /** Disable viewport-constrained max height for short static menus (e.g. language switcher). */
  disableMenuScroll?: boolean;
  /** Show a search field inside the menu to filter options by label. */
  searchable?: boolean;
  searchPlaceholder?: string;
  noResultsLabel?: string;
  renderValue?: (option: DropdownOption<T> | undefined) => ReactNode;
  renderOption?: (option: DropdownOption<T>, selected: boolean) => ReactNode;
  /** Override default `option.value === value` selection for menu checkmarks and aria. */
  resolveOptionSelected?: (option: DropdownOption<T>, value: T) => boolean;
  showChevron?: boolean;
  /** Minimum floating menu width in px when wider than the trigger. */
  menuMinWidth?: number;
  /** Maximum list height in px; also capped by available viewport space. */
  menuMaxHeight?: number;
  /** Horizontal alignment of the menu relative to the trigger. */
  menuAlign?: FloatingMenuAlign;
  /** Open on pointer hover (fine pointers only); keeps menu open while cursor is over trigger or menu. */
  openOnHover?: boolean;
  /** Slide/fade dismiss animation (marketing language switcher on desktop). */
  animateMenuDismiss?: boolean;
};
