"use client";

import {
  coachDropdownPlaceholderKey,
} from "@/components/admin/admin-schedule-coach-filter";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_FOOTER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_LEDE_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { SessionFormCalendarSection } from "@/components/admin/admin-schedule-session-form-calendar";
import type { SessionClassTypeOption } from "@/components/admin/admin-schedule-session-class-type-resolve";
import type {
  AdminScheduleCoach,
  AdminScheduleSession,
} from "@/components/admin/admin-schedule-session.types";
import { useAdminScheduleSessionFormSheet } from "@/components/admin/use-admin-schedule-session-form-sheet";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmFilterMultiSelect } from "@/components/ui/omm-filter-multi-select";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmFormDropdown } from "@/components/ui/omm-select-dropdown";
import { TimePickerInput } from "@/components/ui/time-picker-input";

export type SessionFormSheetProps = {
  isOpen: boolean;
  mode: "create" | "edit" | "duplicate";
  row?: AdminScheduleSession;
  anchorDay?: string | null;
  classTypeOptions: readonly SessionClassTypeOption[];
  coaches: readonly AdminScheduleCoach[];
  onClose: () => void;
  onSaved: (row: AdminScheduleSession | AdminScheduleSession[]) => void;
};

export function SessionFormSheet({
  isOpen,
  mode,
  row,
  anchorDay,
  classTypeOptions,
  coaches,
  onClose,
  onSaved,
}: SessionFormSheetProps) {
  const sheet = useAdminScheduleSessionFormSheet({
    mode,
    row,
    anchorDay,
    classTypeOptions,
    coaches,
    onSaved,
  });

  return (
    <OmmDrawerPortal
      isOpen={isOpen}
      onClose={onClose}
      backdropAriaLabel={sheet.t("modalBackdropClose")}
      ariaLabelledBy={sheet.titleId}
      closeDisabled={sheet.pending}
      overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      panelClassName={ADMIN_WIDE_DRAWER_PANEL_CLASS}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 id={sheet.titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
              {mode === "create"
                ? sheet.t("createTitle")
                : mode === "duplicate"
                  ? sheet.t("duplicateTitle")
                  : sheet.t("editTitle")}
            </h2>
            <p className={ADMIN_DETAILS_SHEET_LEDE_CLASS}>
              {mode === "duplicate"
                ? sheet.t("duplicateDescription")
                : mode === "create"
                  ? sheet.t("createDescription")
                  : sheet.t("editDescription")}
            </p>
          </div>
          <button
            type="button"
            className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
            onClick={onClose}
            aria-label={sheet.t("modalCloseAria")}
            disabled={sheet.pending}
          >
            ×
          </button>
        </div>
      </header>
      <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
        <form
          id={sheet.formId}
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            void sheet.submit(event);
          }}
        >
          <OmmFormDropdown
            value={sheet.form.classTypeId}
            ariaLabel={sheet.t("form.classType")}
            placeholderLabel={sheet.t("form.classType")}
            options={classTypeOptions.map((type) => ({ value: type.value, label: type.label }))}
            onChange={sheet.onClassTypeChange}
            disabled={sheet.pending}
          />
          <OmmFormDropdown
            value={sheet.coachDropdown.coachId}
            ariaLabel={sheet.t("form.coach")}
            placeholderLabel={sheet.t(coachDropdownPlaceholderKey(sheet.coachDropdown.placeholder))}
            options={sheet.coachDropdown.options}
            onChange={(value) => sheet.setForm((current) => ({ ...current, coachId: value }))}
            disabled={sheet.pending || sheet.coachDropdown.disabled}
            required
          />
          {!sheet.isBatchCreate ? (
            <>
              <DatePickerInput
                name="date"
                value={sheet.form.date}
                onChange={(value) => sheet.setForm((current) => ({ ...current, date: value }))}
                ariaLabel={sheet.t("form.date")}
                required
              />
              <TimePickerInput
                name="startTime"
                value={sheet.form.startTime}
                onChange={(value) => sheet.setForm((current) => ({ ...current, startTime: value }))}
                required
              />
              <TimePickerInput
                name="endTime"
                value={sheet.form.endTime}
                onChange={(value) => sheet.setForm((current) => ({ ...current, endTime: value }))}
                required
              />
            </>
          ) : null}
          <label className="flex min-w-0 flex-col gap-1">
            <span className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-sage-500">
              {sheet.t("form.capacityHint")}
            </span>
            <input
              className="ommm-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={sheet.form.capacity}
              onChange={(event) =>
                sheet.setForm((current) => ({
                  ...current,
                  capacity: event.target.value.replace(/\D/g, ""),
                }))
              }
              placeholder={sheet.t("form.capacity")}
              required
            />
          </label>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-sage-500">
              {sheet.t("form.level")}
            </span>
            <OmmFilterMultiSelect
              ariaLabel={sheet.t("form.level")}
              allLabel={sheet.t("filters.allLevels")}
              selectedValues={sheet.form.levels}
              options={sheet.levelOptions}
              onChange={(value) => sheet.setForm((current) => ({ ...current, levels: value }))}
              className="w-full"
              formatSelectedCount={(count) => sheet.t("filters.selectedCount", { count })}
            />
          </div>
          {sheet.isBatchCreate ? (
            <SessionFormCalendarSection
              calendarStartDate={sheet.calendarStartDate}
              calendarEndDate={sheet.calendarEndDate}
              calendarSlots={sheet.calendarSlots}
              onCalendarStartDateChange={sheet.setCalendarStartDate}
              onCalendarEndDateChange={sheet.setCalendarEndDate}
              onAddSlot={sheet.addCalendarSlot}
              onUpdateSlot={sheet.updateCalendarSlot}
              onRemoveSlot={sheet.removeCalendarSlot}
            />
          ) : null}
          <textarea
            className="ommm-input min-h-24 sm:col-span-2"
            value={sheet.form.description}
            onChange={(event) =>
              sheet.setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder={sheet.t("form.description")}
          />
          {sheet.error ? (
            <p className="app-alert-warn text-sm sm:col-span-2">{sheet.error}</p>
          ) : null}
        </form>
      </div>
      <footer className={`${ADMIN_DETAILS_SHEET_FOOTER_CLASS} flex justify-end gap-2`}>
        <OmmButton type="button" size="sm" variant="ghost" onClick={onClose} disabled={sheet.pending}>
          {sheet.t("cancelButton")}
        </OmmButton>
        <OmmButton
          type="submit"
          size="sm"
          variant="primary"
          form={sheet.formId}
          disabled={sheet.pending}
        >
          {sheet.pending
            ? sheet.t("savingButton")
            : mode === "create"
              ? sheet.t("createButton")
              : sheet.t("saveButton")}
        </OmmButton>
      </footer>
    </OmmDrawerPortal>
  );
}
