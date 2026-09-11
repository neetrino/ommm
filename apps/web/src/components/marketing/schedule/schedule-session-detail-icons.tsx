type ScheduleSessionDetailIconProps = {
  className?: string;
};

/** Calendar outline for session-detail banner meta. */
export function ScheduleSessionDetailCalendarIcon({
  className,
}: ScheduleSessionDetailIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.85}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M8 2v4m8-4v4" />
      <rect x="3" y="4.5" width="18" height="16" rx="3" />
      <path d="M3 9h18" />
    </svg>
  );
}

/** Clock outline for session-detail banner meta. */
export function ScheduleSessionDetailClockIcon({
  className,
}: ScheduleSessionDetailIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.85}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

/** Map pin outline for session-detail banner meta. */
export function ScheduleSessionDetailPinIcon({
  className,
}: ScheduleSessionDetailIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.85}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
