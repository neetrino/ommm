import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function MarketingHomePage() {
  const m = await getTranslations("marketing");

  const features = [
    {
      title: m("featureScheduleTitle"),
      body: m("featureScheduleBody"),
    },
    {
      title: m("featureMembershipsTitle"),
      body: m("featureMembershipsBody"),
    },
    {
      title: m("featureUpdatesTitle"),
      body: m("featureUpdatesBody"),
    },
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-zinc-200/80 bg-gradient-to-b from-white via-zinc-50/80 to-zinc-50">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden
        >
          <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-zinc-200/60 blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-zinc-300/40 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-16 sm:pb-24 sm:pt-20 md:pt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Ommm
          </p>
          <h1 className="mt-4 max-w-3xl app-page-heading">{m("heroTitle")}</h1>
          <p className="app-lede">{m("heroSubtitle")}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/account/classes" className="app-btn-primary text-center">
              {m("heroCta")}
            </Link>
            <Link
              href="/memberships"
              className="app-btn-secondary text-center"
            >
              {m("membershipsCta")}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <h2 className="app-section-heading text-center">
          {m("homeFeaturesTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-zinc-600 sm:text-base">
          {m("homeFeaturesLead")}
        </p>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <li key={f.title} className="app-surface-card p-6">
              <h3 className="text-lg font-semibold text-zinc-900">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                {f.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <div className="app-surface-card flex flex-col gap-6 bg-zinc-50/50 p-8 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">
                {m("closingTitle")}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                {m("closingBody")}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:items-end">
              <Link href="/register" className="app-btn-primary w-full text-center sm:w-auto">
                {m("closingPrimaryCta")}
              </Link>
              <Link
                href="/memberships"
                className="app-btn-secondary w-full text-center sm:w-auto"
              >
                {m("closingSecondary")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
