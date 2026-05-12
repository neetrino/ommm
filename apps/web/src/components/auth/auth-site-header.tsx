"use client";

import { Link } from "@/i18n/navigation";

export function AuthSiteHeader() {
  return (
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
  );
}
