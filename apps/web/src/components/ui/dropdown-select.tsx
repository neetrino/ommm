"use client";

import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { ChevronDownIcon } from "@/components/marketing/schedule/schedule-view-icons";
import { DropdownSelectMenu } from "@/components/ui/dropdown-select-menu";
import { mergeClasses, optionLabelClassName } from "@/components/ui/dropdown-select.helpers";
import type { DropdownSelectProps } from "@/components/ui/dropdown-select.types";
import { useDropdownSelect } from "@/components/ui/dropdown-select.use";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import { getOmmmOverlayPortalRoot } from "@/lib/ommm-overlay-portal";

export type { DropdownOption, DropdownSelectProps } from "@/components/ui/dropdown-select.types";

export function DropdownSelect<T extends string>({
  label,
  ariaLabel,
  value,
  options,
  onChange,
  name,
  disabled = false,
  required = false,
  className,
  triggerClassName,
  menuClassName,
  wrapLabel = false,
  wrapMenuLabel,
  disableMenuScroll = false,
  searchable = false,
  searchPlaceholder = "",
  noResultsLabel = "",
  renderValue,
  renderOption,
  resolveOptionSelected,
  showChevron = true,
  menuMinWidth,
  menuAlign,
  openOnHover = false,
  animateMenuDismiss = false,
  toggleDeselectValue,
}: DropdownSelectProps<T>) {
  const portalReady = useIsClientMounted();
  const {
    rootRef,
    triggerRef,
    menuRef,
    searchInputRef,
    optionRefs,
    listboxId,
    selected,
    selectedIndex,
    isMenuOpen,
    menuExitHold,
    menuMotionActive,
    menuDismissMotion,
    menuAnimatedIn,
    menuPosition,
    listMaxHeight,
    visibleOptions,
    safeFocusedIndex,
    searchQuery,
    setSearchQuery,
    closeAndFocusTrigger,
    selectValue,
    openMenu,
    handleMenuTransitionEnd,
    handleHoverZoneEnter,
    handleHoverZoneLeave,
    onSearchKeyDown,
    onOptionKeyDown,
    onTriggerKeyDown,
  } = useDropdownSelect({
    value,
    options,
    onChange,
    disabled,
    searchable,
    disableMenuScroll,
    menuMinWidth,
    menuAlign,
    openOnHover,
    animateMenuDismiss,
    toggleDeselectValue,
  });

  const menuLabelWrap = wrapMenuLabel ?? wrapLabel;

  const triggerContent: ReactNode = renderValue ? (
    renderValue(selected)
  ) : (
    <span
      className={mergeClasses(
        optionLabelClassName(wrapLabel),
        "text-sm font-semibold text-[#464646]",
      )}
    >
      {selected?.label ?? label}
    </span>
  );

  const showMenu =
    (menuMotionActive ? menuExitHold : isMenuOpen) && menuPosition !== null && portalReady;

  return (
    <div
      ref={rootRef}
      className={mergeClasses("ommm-dropdown-root", className)}
      onMouseEnter={openOnHover ? handleHoverZoneEnter : undefined}
      onMouseLeave={openOnHover ? handleHoverZoneLeave : undefined}
    >
      <p className="sr-only">{ariaLabel}</p>
      <button
        ref={triggerRef}
        type="button"
        className={mergeClasses(
          "ommm-dropdown-trigger",
          wrapLabel ? "h-auto min-h-11 items-start py-2.5" : undefined,
          triggerClassName,
        )}
        data-open={isMenuOpen ? "true" : "false"}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isMenuOpen}
        aria-controls={listboxId}
        disabled={disabled || options.length === 0}
        onClick={() => (isMenuOpen ? closeAndFocusTrigger() : openMenu(selectedIndex))}
        onKeyDown={onTriggerKeyDown}
      >
        {triggerContent}
        {showChevron ? (
          <span
            data-dropdown-chevron=""
            className={mergeClasses(
              "ml-auto inline-flex shrink-0 origin-center text-sage-500 transition-transform duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
              isMenuOpen ? "rotate-180" : "rotate-0",
              wrapLabel ? "self-center" : undefined,
            )}
          >
            <ChevronDownIcon />
          </span>
        ) : null}
      </button>

      {showMenu
        ? createPortal(
            <DropdownSelectMenu
              menuRef={menuRef}
              menuMotionActive={menuMotionActive}
              menuDismissMotion={menuDismissMotion}
              menuAnimatedIn={menuAnimatedIn}
              menuClassName={menuClassName}
              menuPosition={menuPosition}
              openOnHover={openOnHover}
              onHoverZoneEnter={handleHoverZoneEnter}
              onHoverZoneLeave={handleHoverZoneLeave}
              onMenuTransitionEnd={handleMenuTransitionEnd}
              disableMenuScroll={disableMenuScroll}
              searchable={searchable}
              searchQuery={searchQuery}
              searchPlaceholder={searchPlaceholder}
              searchInputRef={searchInputRef}
              onSearchQueryChange={setSearchQuery}
              onSearchKeyDown={onSearchKeyDown}
              listboxId={listboxId}
              ariaLabel={ariaLabel}
              listMaxHeight={listMaxHeight}
              noResultsLabel={noResultsLabel}
              visibleOptions={visibleOptions}
              value={value}
              renderOption={renderOption}
              resolveOptionSelected={resolveOptionSelected}
              wrapLabel={menuLabelWrap}
              safeFocusedIndex={safeFocusedIndex}
              optionRefs={optionRefs}
              onSelectValue={selectValue}
              onOptionKeyDown={onOptionKeyDown}
            />,
            getOmmmOverlayPortalRoot(),
          )
        : null}

      {name ? <input type="hidden" name={name} value={value} required={required} /> : null}
    </div>
  );
}
