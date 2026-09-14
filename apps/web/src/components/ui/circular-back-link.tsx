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

/** Frosted white circle back control — shared by auth, member, and admin page heroes. */
export const CIRCULAR_BACK_LINK_CLASS = [
  "inline-flex h-11 w-11 items-center justify-center rounded-full",
  "border border-white/80 bg-white/90 text-sage-700",
  "backdrop-blur-md",
  "transition-[color,background-color,border-color,transform] duration-200",
  "hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-sand-700",
  "motion-reduce:transform-none",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

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
