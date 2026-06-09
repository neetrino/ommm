import type { ReactNode } from "react";

type UserSheetPageFiltersBarProps = {
  embeddedInSheet?: boolean;
  search: ReactNode;
  trailing?: ReactNode;
};

/** Search + filters row — stacks vertically inside the member hub bottom sheet. */
export function UserSheetPageFiltersBar({
  embeddedInSheet = false,
  search,
  trailing,
}: UserSheetPageFiltersBarProps) {
  if (embeddedInSheet) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-3">
        {search}
        {trailing ? (
          <div className="flex w-full min-w-0 justify-start">{trailing}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      {search}
      {trailing}
    </div>
  );
}
