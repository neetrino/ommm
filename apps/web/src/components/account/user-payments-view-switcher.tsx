"use client";

import { UserListBoardViewSwitcher } from "@/components/account/user-list-board-view-switcher";
import type { UserPaymentsViewMode } from "@/lib/user-payments-view-preference";

type UserPaymentsViewSwitcherProps = {
  value: UserPaymentsViewMode;
  onChange: (mode: UserPaymentsViewMode) => void;
};

export function UserPaymentsViewSwitcher({ value, onChange }: UserPaymentsViewSwitcherProps) {
  return (
    <UserListBoardViewSwitcher
      pageId="payments"
      namespace="userPages.payments"
      value={value}
      onChange={onChange}
    />
  );
}
