import type { ReactNode } from "react";

type UserSheetPageFiltersBarProps = {
  embeddedInSheet?: boolean;
  search: ReactNode;
  trailing?: ReactNode;
};

/** Nudge search below sheet header / title on mobile. */
const USER_SHEET_PAGE_FILTERS_SEARCH_OFFSET_CLASS = "max-md:mt-[2px]";

/** Search + filters row — stacks vertically inside the member hub bottom sheet. */
export function UserSheetPageFiltersBar({
  embeddedInSheet = false,
  search,
  trailing,
}: UserSheetPageFiltersBarProps) {
  if (embeddedInSheet) {
    return (
      <div
        className={`flex w-full min-w-0 flex-col gap-3 ${USER_SHEET_PAGE_FILTERS_SEARCH_OFFSET_CLASS}`}
      >
        {search}
        {trailing ? (
          <div className="flex w-full min-w-0 justify-start">{trailing}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-2 ${USER_SHEET_PAGE_FILTERS_SEARCH_OFFSET_CLASS}`}
    >
      {search}
      {trailing}
    </div>
  );
}
