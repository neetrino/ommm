"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type {
  AdminScheduleCoach,
  AdminScheduleSession,
} from "@/components/admin/admin-schedule-management";
import type { SessionEditFormController } from "@/components/admin/admin-schedule-session-edit-form.use";
import {
  buildSessionLevelOptions,
  type SessionClassTypeOption,
} from "@/components/admin/admin-schedule-session-class-type-resolve";
import {
  coachName,
  durationMinutes,
  spotsLeft,
} from "@/components/admin/admin-schedule-session-display";
import {
  SESSION_SHEET_TAB_ACTIONS,
  SESSION_SHEET_TAB_BOOKINGS,
  SESSION_SHEET_TAB_DETAILS,
  type SessionSheetTabId,
} from "@/components/admin/admin-schedule-session-sheet-tabs";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmFilterMultiSelect } from "@/components/ui/omm-filter-multi-select";
import { OmmFormDropdown } from "@/components/ui/omm-select-dropdown";
import { OmmButton } from "@/components/ui/omm-button";
import { TimePickerInput } from "@/components/ui/time-picker-input";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { formatDateTimeForUi } from "@/lib/date-display";

const SECTION_CLASS =
  "rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.28)] backdrop-blur-md sm:p-5";

type SessionSheetTabPanelsProps = {
  activeTab: SessionSheetTabId;
  locale: string;
  row: AdminScheduleSession;
  classTypeOptions: readonly SessionClassTypeOption[];
  coaches: readonly AdminScheduleCoach[];
  controller: SessionEditFormController;
  actionBusy: boolean;
  onDuplicate: (row: AdminScheduleSession) => void;
  onDelete: (row: AdminScheduleSession) => void;
};

export function SessionSheetTabPanels({
  activeTab,
  locale,
  row,
  classTypeOptions,
  coaches,
  controller,
  actionBusy,
  onDuplicate,
  onDelete,
}: SessionSheetTabPanelsProps) {
  const t = useTranslations("adminPages.classes");
  const [pendingDelete, setPendingDelete] = useState(false);
  const { form, updateForm } = controller;

  const levelOptions = useMemo(
    () => buildSessionLevelOptions((key) => t(key), [...form.levels]),
    [form.levels, t],
  );

  if (activeTab === SESSION_SHEET_TAB_DETAILS) {
    return (
      <section className={`${SECTION_CLASS} grid gap-3 sm:grid-cols-2`}>
        <input
          className="ommm-input sm:col-span-2"
          value={form.title}
          onChange={(event) => updateForm({ ...form, title: event.target.value })}
          placeholder={t("form.className")}
          required
        />
        <OmmFormDropdown
          value={form.classTypeId}
          ariaLabel={t("form.classType")}
          placeholderLabel={t("form.classType")}
          options={classTypeOptions.map((type) => ({ value: type.value, label: type.label }))}
          onChange={(value) => updateForm({ ...form, classTypeId: value })}
        />
        <OmmFormDropdown
          value={form.coachId}
          ariaLabel={t("form.coach")}
          placeholderLabel={t("form.coach")}
          options={coaches.map((coach) => ({ value: coach.id, label: coachName(coach) }))}
          onChange={(value) => updateForm({ ...form, coachId: value })}
        />
        <DatePickerInput
          name="date"
          value={form.date}
          onChange={(value) => updateForm({ ...form, date: value })}
          ariaLabel={t("form.date")}
          required
        />
        <TimePickerInput
          name="startTime"
          value={form.startTime}
          onChange={(value) => updateForm({ ...form, startTime: value })}
          required
        />
        <TimePickerInput
          name="endTime"
          value={form.endTime}
          onChange={(value) => updateForm({ ...form, endTime: value })}
          required
        />
        <label className="flex flex-col gap-1">
          <span className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-sage-500">
            {t("form.capacityHint")}
          </span>
          <input
            className="ommm-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={form.capacity}
            onChange={(event) =>
              updateForm({ ...form, capacity: event.target.value.replace(/\D/g, "") })
            }
            placeholder={t("form.capacity")}
            required
          />
        </label>
        <OmmFilterMultiSelect
          ariaLabel={t("form.level")}
          allLabel={t("form.level")}
          selectedValues={form.levels}
          options={levelOptions}
          onChange={(value) => updateForm({ ...form, levels: value })}
          className="sm:col-span-2"
          triggerClassName="text-center"
          formatSelectedCount={(count) => t("filters.selectedCount", { count })}
        />
        <textarea
          className="ommm-input min-h-24 sm:col-span-2"
          value={form.description}
          onChange={(event) => updateForm({ ...form, description: event.target.value })}
          placeholder={t("form.description")}
        />
      </section>
    );
  }

  if (activeTab === SESSION_SHEET_TAB_BOOKINGS) {
    return (
      <section className={SECTION_CLASS}>
        <h3 className="text-base font-semibold text-sage-950">{t("sheetTabs.bookingsHeading")}</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <MetricRow
            label={t("colCapacity")}
            value={`${row._count.bookings}/${row.capacity}`}
          />
          <MetricRow
            label={t("fields.spotsLeft", { count: spotsLeft(row) })}
            value={String(spotsLeft(row))}
          />
          <MetricRow
            label={t("fields.duration")}
            value={`${durationMinutes(row)}m`}
          />
          <MetricRow label={t("colStatus")} value={t(`status.${row.status}`)} />
          <MetricRow
            label={t("colDate")}
            value={formatDateTimeForUi(row.startsAt, locale)}
          />
        </dl>
        {row._count.bookings === 0 ? (
          <p className="mt-4 text-sm text-sage-500">{t("sheetTabs.bookingsEmpty")}</p>
        ) : null}
      </section>
    );
  }

  if (activeTab === SESSION_SHEET_TAB_ACTIONS) {
    return (
      <>
        <section className={`${SECTION_CLASS} flex flex-wrap gap-2`}>
          <OmmButton
            type="button"
            size="sm"
            variant="secondary"
            disabled={actionBusy}
            onClick={() => onDuplicate(row)}
          >
            {t("duplicateButton")}
          </OmmButton>
          <OmmButton
            type="button"
            size="sm"
            variant="danger"
            disabled={actionBusy}
            onClick={() => setPendingDelete(true)}
          >
            {t("actions.delete")}
          </OmmButton>
        </section>

        <OmmConfirmDialog
          isOpen={pendingDelete}
          title={t("confirmDeleteTitle")}
          description={t("deleteConfirm")}
          confirmLabel={actionBusy ? t("savingButton") : t("confirmDialogDelete")}
          cancelLabel={t("confirmDialogNo")}
          backdropAriaLabel={t("confirmDialogBackdrop")}
          tone="danger"
          confirmClassName="ommm-btn-lifecycle-action--danger"
          pending={actionBusy}
          onConfirm={() => {
            onDelete(row);
            setPendingDelete(false);
          }}
          onCancel={() => {
            if (!actionBusy) {
              setPendingDelete(false);
            }
          }}
        />
      </>
    );
  }

  return null;
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <dt className="text-sage-500">{label}</dt>
      <dd className="font-medium text-sage-900">{value}</dd>
    </div>
  );
}
