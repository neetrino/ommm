import Image from "next/image";
import { HeroCopy } from "@/components/home-hero/hero-copy";
import { SiteHeader } from "@/components/site-header/site-header";

/** Hero crop: vertical focus below center; higher % shifts crop further in the same direction. */
const HERO_IMAGE_OBJECT_POSITION_CLASS = "object-[center_100%]" as const;

export default function Home() {
  return (
    <main className="w-full bg-white">
      <section
        className="relative h-[100vh] w-full overflow-hidden"
        aria-label="Hero"
      >
        <Image
          src="/hero/home-hero.webp"
          alt="Woman practicing yoga in a bright studio with city view"
          fill
          priority
          sizes="100vw"
          className={`z-0 object-cover ${HERO_IMAGE_OBJECT_POSITION_CLASS}`}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-36 bg-gradient-to-b from-black/45 via-black/15 to-transparent sm:h-40"
          aria-hidden
        />
        <HeroCopy />
        <SiteHeader />
      </section>
    </main>
  );
}
