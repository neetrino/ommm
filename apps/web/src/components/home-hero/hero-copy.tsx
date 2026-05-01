import Link from "next/link";

const HEADLINE_LINE_1 = "Unveiling the world's first";
const HEADLINE_LINE_2 = "Social Wellness & Performance Club™";
const CTA_LABEL = "Discover more";
const CTA_HREF = "/services";

const headlineShadow =
  "[text-shadow:0_2px_28px_rgba(0,0,0,0.55),0_1px_6px_rgba(0,0,0,0.65)]";

const ctaClassName =
  "mt-10 inline-flex items-center justify-center rounded-full border border-white/75 bg-white/[0.08] px-10 py-3 text-sm font-medium tracking-wide text-white backdrop-blur-[2px] transition-[border-color,background-color,box-shadow] duration-300 hover:border-white hover:bg-white/[0.14] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.55)]";

export function HeroCopy() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[15] flex items-center justify-center px-5 pb-10 pt-28 sm:px-8 sm:pt-32 md:px-10 md:pt-36">
      <div className="pointer-events-auto max-w-[min(100%,36rem)] text-center md:max-w-3xl lg:max-w-4xl">
        <h1
          className={`font-sans text-[1.35rem] font-light leading-snug tracking-[-0.02em] text-white/98 sm:text-2xl md:text-3xl md:leading-tight lg:text-4xl ${headlineShadow}`}
        >
          <span className="block">{HEADLINE_LINE_1}</span>
          <span className="mt-2 block font-normal tracking-[-0.015em] md:mt-3">
            {HEADLINE_LINE_2}
          </span>
        </h1>
        <Link href={CTA_HREF} className={ctaClassName}>
          {CTA_LABEL}
        </Link>
      </div>
    </div>
  );
}
