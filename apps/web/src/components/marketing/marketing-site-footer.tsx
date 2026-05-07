import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function MarketingSiteFooter() {
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");
  const tFooter = await getTranslations("footer");

  const cols = [
    {
      title: tFooter("discoverTitle"),
      links: [
        { href: "/story", label: tNav("story") },
        { href: "/coaches", label: tNav("coaches") },
        { href: "/memberships", label: tNav("memberships") },
      ],
    },
    {
      title: tFooter("memberTitle"),
      links: [
        { href: "/explore", label: tNav("explore") },
        { href: "/contact", label: tNav("contact") },
        { href: "/login", label: tCommon("login") },
        { href: "/account", label: tCommon("account") },
      ],
    },
  ];

  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div>
            <p className="text-base font-semibold tracking-tight text-zinc-900">
              Ommm
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-600">
              {tFooter("tagline")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            {cols.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {col.title}
                </p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-10 border-t border-zinc-100 pt-8 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} Ommm · studio
        </p>
      </div>
    </footer>
  );
}
