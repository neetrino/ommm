import { buildContentPostUpdatedDisplay } from "@/components/shared/content/content-post-display-helpers";
import { SessionDateTimeListDateChip } from "@/components/shared/schedule/session-datetime-list-display";

type ContentPostUpdatedDatetimeProps = {
  locale: string;
  updatedAt: string;
};

export function ContentPostUpdatedDatetime({
  locale,
  updatedAt,
}: ContentPostUpdatedDatetimeProps) {
  const display = buildContentPostUpdatedDisplay(locale, updatedAt);
  if (display === null) {
    return <p className="text-sm text-sage-500">—</p>;
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <SessionDateTimeListDateChip display={display} />
      <p className="font-serif text-xl leading-none tracking-tight text-sage-950 tabular-nums">
        {display.startTime}
      </p>
    </div>
  );
}
