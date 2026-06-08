import type { ReactNode } from "react";
import { UserMemberShellLayout } from "@/components/account/user-member-shell-layout";

export const dynamic = "force-dynamic";

type UserLayoutProps = {
  children: ReactNode;
  sheet?: ReactNode;
  params: Promise<{ locale: string }>;
};

export default function UserLayout({ children, sheet = null, params }: UserLayoutProps) {
  return (
    <UserMemberShellLayout params={params}>
      {children}
      {sheet}
    </UserMemberShellLayout>
  );
}
