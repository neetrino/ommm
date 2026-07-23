type MemberAccountHubChevronProps = {
  className?: string;
};

export function MemberAccountHubChevron({
  className = "h-4 w-4 shrink-0 text-sage-400",
}: MemberAccountHubChevronProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
