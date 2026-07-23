"use client";

import type { RefObject } from "react";
import { DropdownSelectSearchHeader } from "@/components/ui/dropdown-select-search-header";
import { DefaultOptionContent } from "@/components/ui/dropdown-select-default-option";
import { HOVER_MENU_ANIMATION_MS } from "@/components/ui/dropdown-select.constants";
import { mergeClasses } from "@/components/ui/dropdown-select.helpers";
import type { DropdownOption } from "@/components/ui/dropdown-select.types";
import type { FloatingMenuPosition } from "@/components/ui/use-floating-menu-position";
import { OMMM_FLOATING_MENU_Z_INDEX } from "@/lib/ommm-overlay-portal";

type DropdownSelectMenuProps<T extends string> = {
  menuRef: RefObject<HTMLDivElement | null>;
  menuMotionActive: boolean;
  menuDismissMotion: boolean;
  menuAnimatedIn: boolean;
  menuClassName?: string;
  menuPosition: FloatingMenuPosition;
  openOnHover: boolean;
  onHoverZoneEnter: () => void;
  onHoverZoneLeave: () => void;
  onMenuTransitionEnd: (event: React.TransitionEvent<HTMLDivElement>) => void;
  disableMenuScroll: boolean;
  searchable: boolean;
  searchQuery: string;
  searchPlaceholder: string;
  searchInputRef: RefObject<HTMLInputElement | null>;
  onSearchQueryChange: (value: string) => void;
  onSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  listboxId: string;
  ariaLabel: string;
  listMaxHeight: number | undefined;
  noResultsLabel: string;
  visibleOptions: DropdownOption<T>[];
  value: T;
  renderOption?: (option: DropdownOption<T>, selected: boolean) => React.ReactNode;
  resolveOptionSelected?: (option: DropdownOption<T>, value: T) => boolean;
  wrapLabel: boolean;
  safeFocusedIndex: number;
  optionRefs: RefObject<Array<HTMLButtonElement | null>>;
  onSelectValue: (value: T) => void;
  onOptionKeyDown: (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    option: DropdownOption<T>,
  ) => void;
};

export function DropdownSelectMenu<T extends string>({
  menuRef,
  menuMotionActive,
  menuDismissMotion,
  menuAnimatedIn,
  menuClassName,
  menuPosition,
  openOnHover,
  onHoverZoneEnter,
  onHoverZoneLeave,
  onMenuTransitionEnd,
  disableMenuScroll,
  searchable,
  searchQuery,
  searchPlaceholder,
  searchInputRef,
  onSearchQueryChange,
  onSearchKeyDown,
  listboxId,
  ariaLabel,
  listMaxHeight,
  noResultsLabel,
  visibleOptions,
  value,
  renderOption,
  resolveOptionSelected,
  wrapLabel,
  safeFocusedIndex,
  optionRefs,
  onSelectValue,
  onOptionKeyDown,
}: DropdownSelectMenuProps<T>) {
  return (
    <div
      ref={menuRef}
      className={mergeClasses(
        "ommm-dropdown-menu",
        menuMotionActive ? "ommm-dropdown-menu--hover-animated" : undefined,
        menuDismissMotion ? "ommm-dropdown-menu--mobile-dismiss" : undefined,
        menuMotionActive && menuAnimatedIn ? "ommm-dropdown-menu--visible" : undefined,
        menuClassName,
      )}
      data-placement={menuPosition.placement}
      onMouseEnter={openOnHover ? onHoverZoneEnter : undefined}
      onMouseLeave={openOnHover ? onHoverZoneLeave : undefined}
      onTransitionEnd={menuMotionActive ? onMenuTransitionEnd : undefined}
      style={{
        position: "fixed",
        zIndex: OMMM_FLOATING_MENU_Z_INDEX,
        top: menuPosition.top,
        left: menuPosition.left,
        width: menuPosition.width,
        maxHeight: disableMenuScroll ? undefined : menuPosition.maxHeight,
        transform: menuMotionActive
          ? undefined
          : menuPosition.placement === "top"
            ? "translate3d(0, -100%, 0)"
            : "translate3d(0, 0, 0)",
        transitionDuration:
          menuMotionActive && !menuDismissMotion ? `${HOVER_MENU_ANIMATION_MS}ms` : undefined,
      }}
    >
      {searchable ? (
        <DropdownSelectSearchHeader
          value={searchQuery}
          placeholder={searchPlaceholder}
          inputRef={searchInputRef}
          onChange={onSearchQueryChange}
          onKeyDown={onSearchKeyDown}
        />
      ) : null}
      <ul
        id={listboxId}
        role="listbox"
        aria-label={ariaLabel}
        className={mergeClasses(
          "ommm-dropdown-menu-list",
          disableMenuScroll ? "ommm-dropdown-menu-list-static" : undefined,
        )}
        style={listMaxHeight === undefined ? undefined : { maxHeight: listMaxHeight }}
      >
        {visibleOptions.length === 0 ? (
          <li className="px-3 py-2 text-sm text-sage-500" role="presentation">
            {noResultsLabel}
          </li>
        ) : null}
        {visibleOptions.map((option, index) => {
          const isSelected = resolveOptionSelected
            ? resolveOptionSelected(option, value)
            : option.value === value;
          return (
            <li key={option.value} role="presentation">
              <button
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                type="button"
                role="option"
                tabIndex={index === safeFocusedIndex ? 0 : -1}
                aria-selected={isSelected}
                className={mergeClasses(
                  "ommm-dropdown-option",
                  renderOption ? "ommm-dropdown-option-custom" : undefined,
                )}
                data-selected={isSelected ? "true" : "false"}
                onClick={() => onSelectValue(option.value)}
                onKeyDown={(event) => onOptionKeyDown(event, index, option)}
              >
                {renderOption ? (
                  renderOption(option, isSelected)
                ) : (
                  <DefaultOptionContent
                    option={option}
                    selected={isSelected}
                    wrapLabel={wrapLabel}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
