import { LogoutButton } from "@/components/logout-button";
import { Link } from "@/i18n/navigation";

export default function CoachSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-indigo-50/40">
      <header className="border-b border-indigo-100 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-3">
          <span className="font-semibold text-indigo-950">Coach</span>
          <nav className="flex flex-wrap gap-3 text-sm text-indigo-900">
            <Link href="/coach" className="hover:underline">
              Schedule
            </Link>
            <LogoutButton className="text-sm text-indigo-900 hover:underline" />
            <Link href="/account" className="ml-auto hover:underline">
              Member zone
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}
