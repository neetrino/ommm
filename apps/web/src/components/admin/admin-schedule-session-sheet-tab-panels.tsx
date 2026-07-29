"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type {
  AdminScheduleCoach,
  AdminScheduleSession,
} from "@/components/admin/admin-schedule-management";
import {
  buildCoachDropdownState,
  coachDropdownPlaceholderKey,
} from "@/components/admin/admin-schedule-coach-filter";
import type { SessionEditFormController } from "@/components/admin/admin-schedule-session-edit-form.use";
import {
  buildSessionLevelOptions,
  type SessionClassTypeOption,
} from "@/components/admin/admin-schedule-session-class-type-resolve";
import { coachName } from "@/components/admin/admin-schedule-session-display";
import {
  SESSION_SHEET_TAB_ACTIONS,
  SESSION_SHEET_TAB_BOOKINGS,
  SESSION_SHEET_TAB_DETAILS,
  type SessionSheetTabId,
} from "@/components/admin/admin-schedule-session-sheet-tabs";
import { AdminSessionBookingsSummary } from "@/components/admin/admin-session-bookings-summary";
import { AdminSessionRegistrationsList } from "@/components/admin/admin-session-registrations-list";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmFilterMultiSelect } from "@/components/ui/omm-filter-multi-select";
import { OmmFormDropdown } from "@/components/ui/omm-select-dropdown";
import { OmmButton } from "@/components/ui/omm-button";
import { TimePickerInput } from "@/components/ui/time-picker-input";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import {
  ADMIN_SHEET_FORM_SECTION_CLASS,
} from "@/components/admin/admin-sheet-editable-field";

const SECTION_CLASS = ADMIN_SHEET_FORM_SECTION_CLASS;

type SessionSheetTabPanelsProps = {
  activeTab: SessionSheetTabId;
  locale: string;
  row: AdminScheduleSession;
  classTypeOptions: readonly SessionClassTypeOption[];
  coaches: readonly AdminScheduleCoach[];
  controller: SessionEditFormController;
  actionBusy: boolean;
  canCancelBooking?: boolean;
  onDuplicate?: (row: AdminScheduleSession) => void;
  onDelete?: (row: AdminScheduleSession) => void;
  onBookingCancelled?: () => void;
  onNotice?: (message: string, tone: "ok" | "err") => void;
};

export function SessionSheetTabPanels({
  activeTab,
  locale,
  row,
  classTypeOptions,
  coaches,
  controller,
  actionBusy,
  canCancelBooking = true,
  onDuplicate,
  onDelete,
  onBookingCancelled,
  onNotice,
}: SessionSheetTabPanelsProps) {
  const t = useTranslations("adminPages.classes");
  const [pendingDelete, setPendingDelete] = useState(false);
  const { form, updateForm } = controller;

  const levelOptions = useMemo(
    () => buildSessionLevelOptions((key) => t(key), [...form.levels]),
    [form.levels, t],
  );
  const coachDropdown = useMemo(
    () =>
      buildCoachDropdownState(
        coaches,
        form.classTypeId,
        classTypeOptions,
        form.coachId,
        coachName,
      ),
    [classTypeOptions, coaches, form.classTypeId, form.coachId],
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
          onChange={(value) => {
            const nextCoachDropdown = buildCoachDropdownState(
              coaches,
              value,
              classTypeOptions,
              form.coachId,
              coachName,
            );
            updateForm({
              ...form,
              classTypeId: value,
              coachId: nextCoachDropdown.coachId,
            });
          }}
        />
        <OmmFormDropdown
          value={coachDropdown.coachId}
          ariaLabel={t("form.coach")}
          placeholderLabel={t(coachDropdownPlaceholderKey(coachDropdown.placeholder))}
          options={coachDropdown.options}
          onChange={(value) => updateForm({ ...form, coachId: value })}
          disabled={coachDropdown.disabled}
          required
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
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-sage-950">
            {t("sheetTabs.bookingsHeading")}
          </h3>
          <AdminSessionBookingsSummary row={row} />
        </div>
        <AdminSessionRegistrationsList
          sessionId={row.id}
          locale={locale}
          active={activeTab === SESSION_SHEET_TAB_BOOKINGS}
          canCancel={canCancelBooking}
          onBookingCancelled={onBookingCancelled}
          onNotice={onNotice}
        />
      </section>
    );
  }

  if (activeTab === SESSION_SHEET_TAB_ACTIONS) {
    if (!onDuplicate && !onDelete) {
      return null;
    }
    return (
      <>
        <section className={`${SECTION_CLASS} flex flex-wrap gap-2`}>
          {onDuplicate ? (
            <OmmButton
              type="button"
              size="sm"
              variant="secondary"
              disabled={actionBusy}
              onClick={() => onDuplicate(row)}
            >
              {t("duplicateButton")}
            </OmmButton>
          ) : null}
          {onDelete ? (
            <OmmButton
              type="button"
              size="sm"
              variant="danger"
              disabled={actionBusy}
              onClick={() => setPendingDelete(true)}
            >
              {t("actions.delete")}
            </OmmButton>
          ) : null}
        </section>

        {onDelete ? (
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
        ) : null}
      </>
    );
  }

  return null;
}
