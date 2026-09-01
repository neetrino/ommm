import { Link } from "@/i18n/navigation";

type CircularBackLinkProps = {
  href: string;
  ariaLabel: string;
  className?: string;
};

function BackChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M15 18 9 12l6-6" />
    </svg>
  );
}

/** Frosted white circle back control — shared by auth and member dashboard. */
export const CIRCULAR_BACK_LINK_CLASS =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/75 text-sage-700 shadow-sm backdrop-blur-md transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

export function CircularBackLink({ href, ariaLabel, className }: CircularBackLinkProps) {
  return (
    <Link
      href={href}
      className={[CIRCULAR_BACK_LINK_CLASS, className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
    >
      <BackChevronIcon />
    </Link>
  );
}
