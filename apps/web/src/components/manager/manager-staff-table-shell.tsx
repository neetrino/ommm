import type { ReactNode } from "react";
import { adminChrome } from "@/components/admin/admin-chrome";

type ManagerStaffTableShellProps = {
  children: ReactNode;
};

/** Read-only staff list tables — shared admin table surface tokens. */
export function ManagerStaffTableShell({ children }: ManagerStaffTableShellProps) {
  return <div className={adminChrome.tableWrap}>{children}</div>;
}
