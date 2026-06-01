"use client";

import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import { OmmButton } from "@/components/ui/omm-button";

const MAX_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 4000;

export type ClassTypeEditorMode = "idle" | "create" | "edit";

export type ClassTypeFormState = {
  name: string;
  description: string;
};

type AdminClassTypesEditorProps = {
  mode: ClassTypeEditorMode;
  form: ClassTypeFormState;
  slugPreview: string;
  selectedSlug: string | null;
  createdAtLabel: string | null;
  updatedAtLabel: string | null;
  selectedSessionCount: number;
  fieldErrors: { name?: string; description?: string };
  pending: boolean;
  error: string | null;
  onFormChange: (next: ClassTypeFormState) => void;
  onNameBlur: () => void;
  onDescriptionBlur: () => void;
  onReset: () => void;
  onDelete: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function AdminClassTypesEditor({
  mode,
  form,
  slugPreview,
  selectedSlug,
  createdAtLabel,
  updatedAtLabel,
  selectedSessionCount,
  fieldErrors,
  pending,
  error,
  onFormChange,
  onNameBlur,
  onDescriptionBlur,
  onReset,
  onDelete,
  onSubmit,
}: AdminClassTypesEditorProps) {
  const t = useTranslations("adminPages.classes.classTypes");

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit}>
      <div className="mb-4">
        <h3 className={adminChrome.panelHeading}>
          {mode === "create" ? t("formCreateTitle") : t("formEditTitle")}
        </h3>
        {mode === "edit" && selectedSlug !== null ? (
          <p className="mt-1 text-xs text-sage-500">{selectedSlug}</p>
        ) : null}
        {mode === "edit" && (createdAtLabel !== null || updatedAtLabel !== null) ? (
          <p className="mt-1 text-xs text-sage-500">
            {createdAtLabel !== null ? t("createdLabel", { date: createdAtLabel }) : null}
            {createdAtLabel !== null && updatedAtLabel !== null ? " · " : null}
            {updatedAtLabel !== null ? t("updatedLabel", { date: updatedAtLabel }) : null}
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        <label className="flex flex-col gap-1.5">
          <span className="ommm-label text-xs uppercase tracking-wide">
            {t("fieldName")}
            <span className="text-red-600" aria-hidden>
              {" "}
              *
            </span>
          </span>
          <input
            className={`ommm-input ${fieldErrors.name ? "border-red-300" : ""}`}
            value={form.name}
            maxLength={MAX_NAME_LENGTH}
            onChange={(event) =>
              onFormChange({ ...form, name: event.target.value })
            }
            onBlur={onNameBlur}
            disabled={pending}
            required
            aria-invalid={fieldErrors.name !== undefined}
            aria-describedby={fieldErrors.name ? "class-type-name-error" : undefined}
          />
          {fieldErrors.name ? (
            <p id="class-type-name-error" className="text-xs text-red-700" role="alert">
              {fieldErrors.name}
            </p>
          ) : null}
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldSlug")}</span>
          <p className="ommm-input bg-white/40 text-sage-600" aria-live="polite">
            {slugPreview.length > 0 ? slugPreview : "—"}
          </p>
          <p className="text-[11px] text-sage-500">{t("slugHint")}</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldDescription")}</span>
          <textarea
            className={`ommm-input min-h-28 ${fieldErrors.description ? "border-red-300" : ""}`}
            value={form.description}
            maxLength={MAX_DESCRIPTION_LENGTH}
            onChange={(event) =>
              onFormChange({ ...form, description: event.target.value })
            }
            onBlur={onDescriptionBlur}
            disabled={pending}
            aria-invalid={fieldErrors.description !== undefined}
          />
          {fieldErrors.description ? (
            <p className="text-xs text-red-700" role="alert">
              {fieldErrors.description}
            </p>
          ) : null}
        </label>

        {mode === "edit" && selectedSessionCount > 0 ? (
          <p className="rounded-xl border border-sand-300/60 bg-sand-50 px-3 py-2 text-xs text-sage-700">
            {t("linkedSessionsHint", { count: selectedSessionCount })}
          </p>
        ) : null}

        {error !== null ? (
          <p className="app-alert-warn text-sm" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/60 pt-4">
        <div>
          {mode === "edit" ? (
            <OmmButton
              type="button"
              size="sm"
              variant="danger"
              disabled={pending}
              onClick={onDelete}
            >
              {t("deleteButton")}
            </OmmButton>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <OmmButton type="button" size="sm" variant="ghost" disabled={pending} onClick={onReset}>
            {t("cancelButton")}
          </OmmButton>
          <OmmButton type="submit" size="sm" variant="primary" disabled={pending}>
            {pending
              ? t("savingButton")
              : mode === "create"
                ? t("createButton")
                : t("saveButton")}
          </OmmButton>
        </div>
      </div>
    </form>
  );
}
