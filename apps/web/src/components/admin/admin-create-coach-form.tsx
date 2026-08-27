"use client";

import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { AdminCreateCoachFormDetailsSection } from "@/components/admin/admin-create-coach-form-details-section";
import { AdminCreateCoachFormPersonalSection } from "@/components/admin/admin-create-coach-form-personal-section";
import { submitAdminCreateCoachForm } from "@/components/admin/admin-create-coach-form-submit";
import type { AdminCreateCoachFocusField } from "@/components/admin/admin-create-coach-form-focus";
import {
  sanitizeCoachPreviewSrc,
  type CoachClassOption,
} from "@/components/admin/admin-coach-form-helpers";
import { FormErrorBanner } from "@/components/ui/form-validation";
import { OmmButton } from "@/components/ui/omm-button";
import {
  ADMIN_CREATE_FORM_ACTIONS_CLASS,
  ADMIN_CREATE_FORM_BODY_CLASS,
  ADMIN_CREATE_FORM_CLASS,
} from "@/components/admin/admin-details-sheet-layout";

export type AdminCreateCoachFormProps = {
  classOptions: readonly CoachClassOption[];
  /** When set, successful create invokes this instead of inline success + refresh (parent handles refresh). */
  onCreated?: () => void;
  /** Optional Cancel (e.g. close modal); omit for standalone usage. */
  onCancel?: () => void;
};

export function AdminCreateCoachForm({
  classOptions,
  onCreated,
  onCancel,
}: AdminCreateCoachFormProps) {
  const t = useTranslations("adminPages.coaches.create");
  const tPage = useTranslations("adminPages.coaches");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<AdminCreateCoachFocusField | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const submitLockRef = useRef(false);
  const [birthdayValue, setBirthdayValue] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
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

  function clearFieldError(): void {
    if (error !== null || errorField !== null) {
      setError(null);
      setErrorField(null);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await submitAdminCreateCoachForm({
      form: e.currentTarget,
      phone,
      selectedClassIds,
      classOptions,
      photoFile,
      pending,
      submitLockRef,
      t,
      onCreated,
      onPhotoSelected,
      setError,
      setErrorField,
      setSuccess,
      setPending,
      setBirthdayValue,
      setSelectedClassIds,
      refresh: () => router.refresh(),
    });
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(ev) => {
        void onSubmit(ev);
      }}
      onInput={clearFieldError}
      className={ADMIN_CREATE_FORM_CLASS}
    >
      <div className={ADMIN_CREATE_FORM_BODY_CLASS}>
        <AdminCreateCoachFormPersonalSection
          formRef={formRef}
          phone={phone}
          onPhoneChange={(value) => {
            clearFieldError();
            setPhone(value);
          }}
          birthdayValue={birthdayValue}
          onBirthdayChange={(value) => {
            clearFieldError();
            setBirthdayValue(value);
          }}
          errorField={errorField}
          errorMessage={error}
          t={t}
        />

        <AdminCreateCoachFormDetailsSection
          classOptions={classOptions}
          selectedClassIds={selectedClassIds}
          onToggleClassSelection={(classTypeId) => {
            clearFieldError();
            toggleClassSelection(classTypeId);
          }}
          photoPreview={photoPreview}
          photoPreviewImgSrc={photoPreviewImgSrc}
          onPhotoSelected={(file) => {
            clearFieldError();
            onPhotoSelected(file);
          }}
          pending={pending}
          errorField={errorField}
          errorMessage={error}
          t={t}
          tPage={tPage}
        />

        {onCreated === undefined && success ? (
          <p className="rounded-xl border border-mint-200/80 bg-mint-50/90 px-3 py-2 text-sm text-sage-800 shadow-sm">
            {t("success")}
          </p>
        ) : null}

        {error !== null ? <FormErrorBanner message={error} /> : null}

        <div className={ADMIN_CREATE_FORM_ACTIONS_CLASS}>
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
      </div>
    </form>
  );
}
