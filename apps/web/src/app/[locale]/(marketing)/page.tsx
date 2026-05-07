import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function MarketingHomePage() {
  const m = await getTranslations("marketing");

  return (
    <section className="mx-auto max-w-5xl px-4 py-20">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
        {m("heroTitle")}
      </h1>
      <p className="mt-6 max-w-xl text-lg text-zinc-600">
        Booking, memberships, classes — full studio platform on web.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/account/classes"
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {m("heroCta")}
        </Link>
        <Link
          href="/memberships"
          className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-800 hover:border-zinc-400"
        >
          {m("membershipsCta")}
        </Link>
      </div>
    </section>
  );
}
