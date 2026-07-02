import {
  MIN_SCHEDULE_SPOTS,
  type CoachScheduleInput,
} from "@/components/admin/admin-coach-form-helpers";
import { PlusIcon } from "@/components/ui/plus-icon";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { TimePickerInput } from "@/components/ui/time-picker-input";
import { OmmButton } from "@/components/ui/omm-button";

type AdminCreateCoachFormScheduleSectionProps = {
  scheduleRows: CoachScheduleInput[];
  pending: boolean;
  onAddScheduleRow: () => void;
  onUpdateScheduleRow: (
    rowId: string,
    key: keyof Omit<CoachScheduleInput, "id">,
    value: string,
  ) => void;
  onRemoveScheduleRow: (rowId: string) => void;
  t: (key: string) => string;
};

export function AdminCreateCoachFormScheduleSection({
  scheduleRows,
  pending,
  onAddScheduleRow,
  onUpdateScheduleRow,
  onRemoveScheduleRow,
  t,
}: AdminCreateCoachFormScheduleSectionProps) {
  return (
    <section className="rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-sage-800">
          Schedule / Availability
        </h3>
        <OmmButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAddScheduleRow}
          disabled={pending}
          className="gap-1.5"
        >
          <PlusIcon className="h-3.5 w-3.5 shrink-0" />
          {t("scheduleAddRow")}
        </OmmButton>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-sand-500/20 bg-white/80 p-3">
        {scheduleRows.map((row, index) => (
          <div
            key={row.id}
            className="grid gap-2 rounded-xl border border-white/70 bg-white/85 p-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_130px_auto]"
          >
            <DatePickerInput
              name={`schedule-date-${index}`}
              ariaLabel={t("scheduleLabel")}
              placeholder={t("scheduleLabel")}
              value={row.date}
              onChange={(nextValue) => onUpdateScheduleRow(row.id, "date", nextValue)}
              disabled={pending}
              required
            />
            <TimePickerInput
              name={`schedule-time-${index}`}
              ariaLabel={t("scheduleLabel")}
              value={row.time}
              onChange={(nextValue) => onUpdateScheduleRow(row.id, "time", nextValue)}
              disabled={pending}
              required
            />
            <input
              type="number"
              min={MIN_SCHEDULE_SPOTS}
              className="ommm-input"
              value={row.spots}
              onChange={(event) => onUpdateScheduleRow(row.id, "spots", event.target.value)}
              disabled={pending}
              required
            />
            <OmmButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemoveScheduleRow(row.id)}
              disabled={pending || scheduleRows.length <= 1}
            >
              {t("scheduleRemoveRow")}
            </OmmButton>
          </div>
        ))}
      </div>
    </section>
  );
}
