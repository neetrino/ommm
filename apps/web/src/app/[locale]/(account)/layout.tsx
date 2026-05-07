import { Link } from "@/i18n/navigation";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-3">
          <Link href="/account" className="font-semibold">
            Account
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm text-zinc-700">
            <Link href="/account" className="hover:text-zinc-900">
              Home
            </Link>
            <Link href="/account/classes" className="hover:text-zinc-900">
              Classes
            </Link>
            <Link href="/account/bookings" className="hover:text-zinc-900">
              Bookings
            </Link>
            <Link href="/account/memberships" className="hover:text-zinc-900">
              Memberships
            </Link>
            <Link href="/account/gift-cards" className="hover:text-zinc-900">
              Gift cards
            </Link>
            <Link href="/account/settings" className="hover:text-zinc-900">
              Settings
            </Link>
            <Link href="/coach" className="hover:text-zinc-900">
              Coach
            </Link>
            <Link href="/admin" className="hover:text-zinc-900">
              Admin
            </Link>
            <Link href="/" className="ml-auto hover:text-zinc-900">
              Marketing site
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}
