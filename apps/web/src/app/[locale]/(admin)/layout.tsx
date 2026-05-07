import { LogoutButton } from "@/components/logout-button";
import { Link } from "@/i18n/navigation";

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
          <span className="font-semibold text-zinc-900">Backoffice</span>
          <nav className="flex flex-wrap gap-3 text-sm text-zinc-700">
            <Link href="/admin" className="hover:text-zinc-900">
              Dashboard
            </Link>
            <Link href="/admin/clients" className="hover:text-zinc-900">
              Clients
            </Link>
            <Link href="/admin/bookings" className="hover:text-zinc-900">
              Bookings
            </Link>
            <Link href="/admin/content" className="hover:text-zinc-900">
              Content
            </Link>
            <LogoutButton className="text-sm text-zinc-700 hover:text-zinc-900" />
            <Link href="/account" className="ml-auto hover:text-zinc-900">
              Member zone
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
