import Image from "next/image";

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
          className="object-cover object-center"
        />
      </section>
    </main>
  );
}
