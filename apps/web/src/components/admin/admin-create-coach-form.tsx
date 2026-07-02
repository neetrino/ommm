"use client";

import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { AdminCreateCoachFormDetailsSection } from "@/components/admin/admin-create-coach-form-details-section";
import { AdminCreateCoachFormPersonalSection } from "@/components/admin/admin-create-coach-form-personal-section";
import { AdminCreateCoachFormScheduleSection } from "@/components/admin/admin-create-coach-form-schedule-section";
import { submitAdminCreateCoachForm } from "@/components/admin/admin-create-coach-form-submit";
import {
  createScheduleRow,
  sanitizeCoachPreviewSrc,
  type CoachClassOption,
  type CoachScheduleInput,
} from "@/components/admin/admin-coach-form-helpers";
import type { ScheduleFilterOption } from "@/components/marketing/schedule/schedule-filter-dropdown";
import { OmmButton } from "@/components/ui/omm-button";

export type AdminCreateCoachFormProps = {
  classTypeOptions: readonly string[];
  classOptions: readonly CoachClassOption[];
  /** When set, successful create invokes this instead of inline success + refresh (parent handles refresh). */
  onCreated?: () => void;
  /** Optional Cancel (e.g. close modal); omit for standalone usage. */
  onCancel?: () => void;
};

export function AdminCreateCoachForm({
  classTypeOptions,
  classOptions,
  onCreated,
  onCancel,
}: AdminCreateCoachFormProps) {
  const t = useTranslations("adminPages.coaches.create");
  const tPage = useTranslations("adminPages.coaches");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const submitLockRef = useRef(false);
  const [classTypeValue, setClassTypeValue] = useState("");
  const [birthdayValue, setBirthdayValue] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [scheduleRows, setScheduleRows] = useState<CoachScheduleInput[]>([createScheduleRow()]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const classTypeDropdownOptions: ScheduleFilterOption<string>[] = classTypeOptions.map(
    (value) => ({
      value,
      label: value,
    }),
  );
  const photoPreview = useMemo(() => {
    return photoPreviewUrl !== null ? sanitizeCoachPreviewSrc(photoPreviewUrl) : null;
  }, [photoPreviewUrl]);
  const photoPreviewImgSrc = useMemo(() => {
    return photoPreview !== null ? encodeURI(photoPreview) : null;
  }, [photoPreview]);

  function onPhotoSelected(file: File | null): void {
    if (photoPreviewUrl !== null) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoFile(file);
    setPhotoPreviewUrl(file !== null ? URL.createObjectURL(file) : null);
  }

  function toggleClassSelection(classTypeId: string): void {
    setSelectedClassIds((prev) =>
      prev.includes(classTypeId)
        ? prev.filter((value) => value !== classTypeId)
        : [...prev, classTypeId],
    );
  }

  function updateScheduleRow(
    rowId: string,
    key: keyof Omit<CoachScheduleInput, "id">,
    value: string,
  ): void {
    setScheduleRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [key]: value } : row)),
    );
  }

  function addScheduleRow(): void {
    setScheduleRows((prev) => [...prev, createScheduleRow()]);
  }

  function removeScheduleRow(rowId: string): void {
    setScheduleRows((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter((row) => row.id !== rowId);
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await submitAdminCreateCoachForm({
      form: e.currentTarget,
      phone,
      classTypeOptions,
      selectedClassIds,
      classOptions,
      scheduleRows,
      photoFile,
      pending,
      submitLockRef,
      t,
      onCreated,
      onPhotoSelected,
      setError,
      setSuccess,
      setPending,
      setClassTypeValue,
      setBirthdayValue,
      setSelectedClassIds,
      setScheduleRows,
      refresh: () => router.refresh(),
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={(ev) => {
        void onSubmit(ev);
      }}
      className="flex flex-col gap-5"
    >
      <AdminCreateCoachFormPersonalSection
        formRef={formRef}
        phone={phone}
        onPhoneChange={setPhone}
        birthdayValue={birthdayValue}
        onBirthdayChange={setBirthdayValue}
        t={t}
      />

      <AdminCreateCoachFormDetailsSection
        classTypeValue={classTypeValue}
        classTypeDropdownOptions={classTypeDropdownOptions}
        onClassTypeChange={setClassTypeValue}
        classOptions={classOptions}
        selectedClassIds={selectedClassIds}
        onToggleClassSelection={toggleClassSelection}
        photoPreview={photoPreview}
        photoPreviewImgSrc={photoPreviewImgSrc}
        onPhotoSelected={onPhotoSelected}
        pending={pending}
        t={t}
        tPage={tPage}
      />

      <AdminCreateCoachFormScheduleSection
        scheduleRows={scheduleRows}
        pending={pending}
        onAddScheduleRow={addScheduleRow}
        onUpdateScheduleRow={updateScheduleRow}
        onRemoveScheduleRow={removeScheduleRow}
        t={t}
      />

      {error !== null ? (
        <p className="app-alert-warn text-sm" role="alert">
          {error}
        </p>
      ) : null}
      {onCreated === undefined && success ? (
        <p className="rounded-xl border border-mint-200/80 bg-mint-50/90 px-3 py-2 text-sm text-sage-800 shadow-sm">
          {t("success")}
        </p>
      ) : null}
      <div className="-mx-5 mt-1 flex flex-wrap items-center justify-end gap-3 border-t border-white/60 bg-white/65 px-5 py-4 backdrop-blur-sm sm:-mx-7 sm:px-7">
        {onCancel !== undefined ? (
          <OmmButton
            type="button"
            variant="secondary"
            size="md"
            disabled={pending}
            onClick={onCancel}
          >
            {tPage("cancelButton")}
          </OmmButton>
        ) : null}
        <OmmButton type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? t("submitting") : t("submit")}
        </OmmButton>
      </div>
    </form>
  );
}
