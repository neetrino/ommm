import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function MarketingSiteFooter({ locale }: { locale: string }) {
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tFooter = await getTranslations({ locale, namespace: "footer" });

  const cols = [
    {
      title: tFooter("discoverTitle"),
      links: [
        { href: "/story", label: tNav("story") },
        { href: "/coaches", label: tNav("coaches") },
        { href: "/packages", label: tNav("memberships") },
      ],
    },
    {
      title: tFooter("memberTitle"),
      links: [
        { href: "/explore", label: tNav("explore") },
        { href: "/contact", label: tNav("contact") },
        { href: "/login", label: tCommon("login") },
        { href: "/user/home", label: tCommon("account") },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/60 bg-white/55 backdrop-blur-md">
      <div className="ommm-container py-14">
        <div className="flex flex-col gap-12 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <p className="font-serif text-xl font-medium tracking-tight text-sage-700">
              Ommm
            </p>
            <p className="mt-3 text-sm leading-relaxed text-sage-500">
              {tFooter("tagline")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            {cols.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sand-700">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-sm text-sage-500 transition-colors hover:text-sage-900"
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
        <p className="mt-12 border-t border-sage-700/10 pt-8 text-center text-xs text-sage-500">
          © {new Date().getFullYear()} Ommm · {tFooter("copyrightSuffix")}
        </p>
      </div>
    </footer>
  );
}
