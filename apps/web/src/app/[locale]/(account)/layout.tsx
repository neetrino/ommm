import type { ReactNode } from "react";

/** Route-group wrapper only; member shell lives in `(account)/user/layout.tsx`. */
export default function AccountRouteGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
