type ScheduleSessionClassHeadingProps = {
  title: string;
  subtitle: string | null;
  coachLine?: string | null;
  titleClass: string;
  subtitleClass: string;
};

/** Session title + optional class subtitle; coach line is mobile-only. */
export function ScheduleSessionClassHeading({
  title,
  subtitle,
  coachLine,
  titleClass,
  subtitleClass,
}: ScheduleSessionClassHeadingProps) {
  return (
    <>
      <p className={titleClass}>{title}</p>
      {subtitle ? <p className={subtitleClass}>{subtitle}</p> : null}
      {coachLine ? <p className={`${subtitleClass} md:hidden`}>{coachLine}</p> : null}
    </>
  );
}
