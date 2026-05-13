import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function MarketingHighlights({ locale }: { locale: string }) {
  const m = await getTranslations({ locale, namespace: "marketing" });

  const items = [
    {
      title: m("featureScheduleTitle"),
      body: m("featureScheduleBody"),
      href: "/user/classes" as const,
    },
    {
      title: m("featureMembershipsTitle"),
      body: m("featureMembershipsBody"),
      href: "/memberships" as const,
    },
    {
      title: m("featureUpdatesTitle"),
      body: m("featureUpdatesBody"),
      href: "/explore" as const,
    },
  ];

  return (
    <section className="relative">
      <div className="ommm-container ommm-section">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="ommm-h2">{m("homeFeaturesTitle")}</h2>
          <p className="ommm-body mt-3">{m("homeFeaturesLead")}</p>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-full flex-col rounded-[28px] border border-white/70 bg-white/60 p-7 shadow-sm ring-1 ring-sage-700/5 backdrop-blur-md transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-28px_rgba(45,40,35,0.35)]"
              >
                <h3 className="font-serif text-xl font-semibold text-sage-800">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-sage-500">
                  {item.body}
                </p>
                <span className="mt-6 text-sm font-semibold text-sand-700">
                  {m("featureCardCta")} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
