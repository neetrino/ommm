import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = await getTranslations("nav");
  const common = await getTranslations("common");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="font-semibold tracking-tight text-zinc-900">
            Ommm
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-zinc-700">
            <Link href="/" className="hover:text-zinc-900">
              {nav("home")}
            </Link>
            <Link href="/story" className="hover:text-zinc-900">
              {nav("story")}
            </Link>
            <Link href="/coaches" className="hover:text-zinc-900">
              {nav("coaches")}
            </Link>
            <Link href="/memberships" className="hover:text-zinc-900">
              {nav("memberships")}
            </Link>
            <Link href="/explore" className="hover:text-zinc-900">
              {nav("explore")}
            </Link>
            <Link href="/contact" className="hover:text-zinc-900">
              {nav("contact")}
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-zinc-900 px-3 py-1 text-white hover:bg-zinc-800"
            >
              {common("login")}
            </Link>
            <Link
              href="/account"
              className="rounded-full border border-zinc-300 px-3 py-1 hover:border-zinc-400"
            >
              {common("account")}
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-zinc-200 bg-white py-8 text-center text-sm text-zinc-500">
        Ommm · studio
      </footer>
    </div>
  );
}
