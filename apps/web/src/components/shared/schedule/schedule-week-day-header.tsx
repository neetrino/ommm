type ScheduleWeekDayHeaderProps = {
  locale: string;
  dayKey: string;
  isToday: boolean;
  isPast: boolean;
  sessionCount: number;
  todayBadge: string;
};

export function ScheduleWeekDayHeader({
  locale,
  dayKey,
  isToday,
  isPast,
  sessionCount,
  todayBadge,
}: ScheduleWeekDayHeaderProps) {
  const date = new Date(`${dayKey}T00:00:00`);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
  const surfaceClass = isToday
    ? "bg-sage-800 text-white shadow-[0_14px_28px_-20px_rgba(45,40,35,0.55)]"
    : isPast
      ? "bg-sage-200/70 text-sage-800"
      : "bg-white/65 text-sage-900";
  const weekdayClass = isToday ? "text-white/70" : "text-sage-500";
  const dayClass = isToday ? "text-white" : "text-sage-900";
  const countClass = isToday ? "bg-white/20 text-white" : "bg-sand-50 text-sage-700";

  return (
    <div
      data-schedule-day={dayKey}
      className={`flex items-start justify-between gap-2 rounded-[20px] px-3 py-2.5 ${surfaceClass}`}
    >
      <div>
        <span className={`block text-[10px] font-semibold uppercase tracking-[0.12em] ${weekdayClass}`}>
          {weekday}
        </span>
        <span className={`mt-1 block text-lg font-semibold tabular-nums ${dayClass}`}>
          {date.getDate()}
        </span>
      </div>
      <div className="flex flex-col items-end gap-1">
        {isToday ? (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
            {todayBadge}
          </span>
        ) : null}
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${countClass}`}>
          {sessionCount}
        </span>
      </div>
    </div>
  );
}
