import type { AdminNavIconSlug } from "@/components/shell/admin-nav-icon-map";

type AdminNavIconProps = {
  slug: AdminNavIconSlug;
  className?: string;
};

const SLUG_SIZE_CLASS: Partial<Record<AdminNavIconSlug, string>> = {
  guestUsers: "h-5 w-5",
  coaches: "h-[18px] w-[23px]",
  clients: "h-[15px] w-5",
  giftCards: "h-5 w-5",
  schedule: "h-[19px] w-[17px]",
  bookings: "h-[19px] w-[17px]",
};

/**
 * Figma admin sidebar glyph — uses exported SVG as a CSS mask so color follows `currentColor`.
 */
export function AdminNavIcon({ slug, className }: AdminNavIconProps) {
  const src = `/icons/admin/${slug}.svg`;
  const sizeClass = className ?? SLUG_SIZE_CLASS[slug] ?? "h-[17px] w-[17px]";

  return (
    <span
      className={`inline-block shrink-0 bg-current ${sizeClass}`}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
      aria-hidden
    />
  );
}
