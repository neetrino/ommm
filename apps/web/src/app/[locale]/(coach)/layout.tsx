import { LogoutButton } from "@/components/logout-button";
import { ShellHeader } from "@/components/shell/shell-header";
import { Link } from "@/i18n/navigation";

const COACH_NAV = [{ href: "/coach/home", label: "Schedule" }] as const;

export default function CoachSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-indigo-50/50">
      <ShellHeader
        brandHref="/coach/home"
        brandLabel="Coach"
        variant="indigo"
        navItems={[...COACH_NAV]}
        trailing={
          <>
            <LogoutButton className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-indigo-950 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 lg:w-auto" />
            <Link
              href="/account"
              className="block w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-indigo-950 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 lg:w-auto lg:text-left"
            >
              Member zone
            </Link>
          </>
        }
      />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">{children}</div>
    </div>
  );
}
