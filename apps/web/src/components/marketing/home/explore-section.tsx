import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

async function exploreTranslator(locale: string) {
  return getTranslations({ locale, namespace: "home.explore" });
}

type ExploreTranslator = Awaited<ReturnType<typeof exploreTranslator>>;

type TileChipKey =
  | "tiles.tuscany.chip"
  | "tiles.protocols.chip"
  | "tiles.breath.chip";

type TileTitleKey =
  | "tiles.tuscany.title"
  | "tiles.protocols.title"
  | "tiles.breath.title";

type TileExcerptKey =
  | "tiles.tuscany.excerpt"
  | "tiles.protocols.excerpt"
  | "tiles.breath.excerpt";

type Tile = {
  id: string;
  image: string;
  chipKey: TileChipKey;
  chipTone: "light" | "dark";
  titleKey: TileTitleKey;
  excerptKey: TileExcerptKey;
};

const TILES: Tile[] = [
  {
    id: "tuscany",
    image: "/marketing/home/tile-retreat.jpg",
    chipKey: "tiles.tuscany.chip",
    chipTone: "light",
    titleKey: "tiles.tuscany.title",
    excerptKey: "tiles.tuscany.excerpt",
  },
  {
    id: "pilates",
    image: "/marketing/home/tile-pilates.jpg",
    chipKey: "tiles.protocols.chip",
    chipTone: "dark",
    titleKey: "tiles.protocols.title",
    excerptKey: "tiles.protocols.excerpt",
  },
  {
    id: "breath",
    image: "/marketing/home/next-class.jpg",
    chipKey: "tiles.breath.chip",
    chipTone: "light",
    titleKey: "tiles.breath.title",
    excerptKey: "tiles.breath.excerpt",
  },
];

export async function ExploreSection({ locale }: { locale: string }) {
  const t = await exploreTranslator(locale);

  return (
    <section className="relative">
      <div className="ommm-container ommm-section">
        <header className="relative mb-10 flex flex-wrap items-end justify-between gap-6 sm:mb-12">
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-10 left-0 hidden font-serif text-[8rem] italic leading-none text-sage-700/[0.06] sm:block"
            >
              News
            </span>
            <h2 className="ommm-h2 relative">{t("title")}</h2>
            <p className="ommm-body mt-3 max-w-md">{t("lead")}</p>
          </div>
          <Link
            href="/explore"
            className="text-sm font-semibold uppercase tracking-[0.18em] text-sand-700 transition-colors hover:text-sage-700"
          >
            {t("allEvents")}
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <FeaturedExplore t={t} />

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:gap-5">
            {TILES.map((tile) => (
              <li key={tile.id}>
                <ExploreTile tile={tile} t={t} />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 flex justify-center sm:mt-16">
          <Link href="/explore" className="ommm-cta-pill text-base">
            {t("exploreMore")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturedExplore({ t }: { t: ExploreTranslator }) {
  return (
    <article className="relative overflow-hidden rounded-[40px] shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)] lg:col-span-7">
      <div className="relative aspect-[4/5] w-full sm:aspect-[16/11] lg:h-full lg:min-h-[520px]">
        <Image
          src="/marketing/home/explore-featured.jpg"
          alt={t("featured.imageAlt")}
          fill
          priority
          loading="eager"
          sizes="(min-width:1024px) 56vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sage-900/85 via-sage-900/20 to-transparent" />

        <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4 sm:inset-x-10 sm:bottom-10">
          <div className="max-w-md text-white">
            <p className="ommm-eyebrow text-cream-50/85">
              {t("featured.eyebrow")}
            </p>
            <h3 className="mt-2 font-serif text-2xl leading-tight sm:text-3xl">
              {t("featured.title")}
            </h3>
            <p className="mt-3 hidden text-sm text-cream-50/80 sm:block">
              {t("featured.excerpt")}
            </p>
          </div>
          <Link
            href="/explore"
            aria-label={t("featured.openLabel")}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-sand-500 to-sage-900 text-white shadow-lg transition-transform hover:-translate-y-0.5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              aria-hidden
            >
              <path
                d="M7 17 17 7M9 7h8v8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

function ExploreTile({ tile, t }: { tile: Tile; t: ExploreTranslator }) {
  const chipClass =
    tile.chipTone === "dark" ? "ommm-chip-dark" : "ommm-chip-light";
  return (
    <Link
      href="/explore"
      className="group flex h-full flex-col gap-4 overflow-hidden rounded-[28px] bg-white/55 p-3 ring-1 ring-white/60 backdrop-blur-md transition-shadow hover:shadow-[0_18px_40px_-20px_rgba(45,40,35,0.35)] sm:flex-row sm:items-center sm:p-4"
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[20px] sm:aspect-square sm:w-44">
        <Image
          src={tile.image}
          alt={t(tile.titleKey)}
          fill
          sizes="(min-width:1024px) 18vw, (min-width:640px) 28vw, 90vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className={`absolute left-3 top-3 ${chipClass}`}>
          {t(tile.chipKey)}
        </span>
      </div>
      <div className="flex-1 px-3 pb-2 sm:px-2 sm:pb-0">
        <h3 className="ommm-h3">{t(tile.titleKey)}</h3>
        <p className="mt-2 text-sm text-sage-500">{t(tile.excerptKey)}</p>
      </div>
    </Link>
  );
}
