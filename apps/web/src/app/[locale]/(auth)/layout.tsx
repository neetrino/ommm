import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col ommm-bg-auth">
      <header className="border-b border-white/50 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-md items-center justify-center px-4 sm:h-16">
          <Link
            href="/"
            className="font-serif text-lg font-semibold tracking-tight text-sage-800"
          >
            Ommm
          </Link>
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <div className="ommm-card w-full max-w-md p-6 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
