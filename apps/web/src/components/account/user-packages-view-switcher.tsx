"use client";

import { UserListBoardViewSwitcher } from "@/components/account/user-list-board-view-switcher";
import type { UserPackagesViewMode } from "@/lib/user-packages-view-preference";

type UserPackagesViewSwitcherProps = {
  value: UserPackagesViewMode;
  onChange: (mode: UserPackagesViewMode) => void;
};

export function UserPackagesViewSwitcher({ value, onChange }: UserPackagesViewSwitcherProps) {
  return (
    <UserListBoardViewSwitcher
      namespace="userPages.packages"
      value={value}
      onChange={onChange}
    />
  );
}
