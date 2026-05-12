import type { ReactNode } from "react";
import { AuthSiteHeader } from "@/components/auth/auth-site-header";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col ommm-bg-auth">
      <AuthSiteHeader />
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <div className="ommm-card w-full max-w-md p-6 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
