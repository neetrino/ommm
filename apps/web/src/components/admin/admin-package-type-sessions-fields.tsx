"use client";

import { useTranslations } from "next-intl";
import {
  MIN_PACKAGE_SESSIONS,
  MAX_PACKAGE_SESSIONS,
  OMMM_INPUT_NUMBER_CLASS,
  preventNumberArrowStep,
} from "@/components/admin/admin-package-form-utils";
import type { TypeSessionRowFieldErrors } from "@/components/admin/admin-package-tier-field-errors";
import {
  canAddTypeSessionRow,
  resolveClassTypeOptionsForEntry,
  type PackageClassTypeOption,
  type PackageTypeSessionFormEntry,
} from "@/components/admin/admin-package-type-sessions.util";
import { AdminRequiredMark, ADMIN_INVALID_FIELD_CLASS } from "@/components/admin/admin-sheet-editable-field";
import { FormFieldError } from "@/components/ui/form-validation";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmFormDropdown } from "@/components/ui/omm-select-dropdown";

type AdminPackageTypeSessionsFieldsProps = {
  entries: readonly PackageTypeSessionFormEntry[];
  classTypeOptions: readonly PackageClassTypeOption[];
  rowFieldErrors?: Readonly<Record<string, TypeSessionRowFieldErrors>>;
  disabled?: boolean;
  onChange: (entries: PackageTypeSessionFormEntry[]) => void;
  onAddRow: () => void;
  onRemoveRow: (entryId: string) => void;
};

function resolveRowTypeErrorMessage(
  entry: PackageTypeSessionFormEntry,
  rowErrors: TypeSessionRowFieldErrors | undefined,
  t: (key: string) => string,
): string | null {
  if (rowErrors?.type !== true) {
    return null;
  }
  if (!entry.classTypeId.trim() && !entry.sessionCount.trim()) {
    return t("emptyError");
  }
  return t("missingTypeError");
}

export function AdminPackageTypeSessionsFields({
  entries,
  classTypeOptions,
  rowFieldErrors = {},
  disabled = false,
  onChange,
  onAddRow,
  onRemoveRow,
}: AdminPackageTypeSessionsFieldsProps) {
  const t = useTranslations("adminPages.packages.typeSessionsForm");
  const tPackages = useTranslations("adminPages.packages");
  const canAddRow = canAddTypeSessionRow(entries, classTypeOptions.length);
  const hasRowErrors = Object.keys(rowFieldErrors).length > 0;

  function updateEntry(
    entryId: string,
    patch: Partial<Pick<PackageTypeSessionFormEntry, "classTypeId" | "sessionCount">>,
  ): void {
    onChange(
      entries.map((entry) => (entry.id === entryId ? { ...entry, ...patch } : entry)),
    );
  }

  function handleTypeChange(entryId: string, currentTypeId: string, nextValue: string): void {
    if (nextValue === currentTypeId && currentTypeId.trim().length > 0) {
      updateEntry(entryId, { classTypeId: "" });
      return;
    }
    updateEntry(entryId, { classTypeId: nextValue });
  }

  return (
    <div className="flex flex-col gap-3" data-form-field="typeSessions" tabIndex={-1}>
      {entries.length === 0 ? (
        <p className="text-sm text-sage-600">{t("empty")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          <div
            className="grid grid-cols-[minmax(0,1fr)_5.5rem_auto] items-center gap-3 px-0.5"
            aria-hidden
          >
            <span className="ommm-label text-[10px] uppercase tracking-wide">
              {tPackages("formSections.typeSessions.heading")}
              <AdminRequiredMark />
            </span>
            <span className="ommm-label text-[10px] uppercase tracking-wide">
              {t("fieldSessionCount")}
              <AdminRequiredMark />
            </span>
            <span className="sr-only">{t("removeRowAria", { index: 0 })}</span>
          </div>
          <ul className="flex flex-col gap-2">
            {entries.map((entry, index) => {
              const rowErrors = rowFieldErrors[entry.id];
              const typeErrorMessage = resolveRowTypeErrorMessage(entry, rowErrors, t);
              const sessionsErrorMessage =
                rowErrors?.sessions === true ? t("invalidSessionCountError") : null;
              const rowTypeOptions = resolveClassTypeOptionsForEntry(
                entry,
                entries,
                classTypeOptions,
              ).map((classType) => ({
                value: classType.id,
                label: classType.name,
              }));

              return (
                <li key={entry.id} className="flex flex-col gap-1.5">
                  <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_auto] items-center gap-3">
                    <div className="min-w-0">
                      <OmmFormDropdown
                        value={entry.classTypeId}
                        ariaLabel={t("fieldType")}
                        placeholderLabel={t("fieldTypePlaceholder")}
                        options={rowTypeOptions}
                        onChange={(nextValue) =>
                          handleTypeChange(entry.id, entry.classTypeId, nextValue)
                        }
                        disabled={disabled}
                        name={`type-${entry.id}`}
                        required
                        triggerClassName={
                          rowErrors?.type === true ? ADMIN_INVALID_FIELD_CLASS : undefined
                        }
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        className={`${OMMM_INPUT_NUMBER_CLASS} ${rowErrors?.sessions === true ? ADMIN_INVALID_FIELD_CLASS : ""}`}
                        min={MIN_PACKAGE_SESSIONS}
                        max={MAX_PACKAGE_SESSIONS}
                        step={1}
                        inputMode="numeric"
                        value={entry.sessionCount}
                        onChange={(event) =>
                          updateEntry(entry.id, { sessionCount: event.target.value })
                        }
                        onKeyDown={preventNumberArrowStep}
                        placeholder={t("fieldSessionCountPlaceholder")}
                        disabled={disabled}
                        aria-label={t("fieldSessionCount")}
                        aria-invalid={rowErrors?.sessions === true}
                        required
                      />
                    </div>
                    <div className="flex items-center justify-end sm:justify-center">
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sage-600 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 disabled:opacity-50"
                        aria-label={t("removeRowAria", { index: index + 1 })}
                        onClick={() => onRemoveRow(entry.id)}
                        disabled={disabled || entries.length <= 1}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          className="h-4 w-4"
                          aria-hidden
                        >
                          <path d="M5 7h14M9 7V5h6v2M10 11v6M14 11v6M7 7l1 14h8l1-14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <FormFieldError message={typeErrorMessage ?? sessionsErrorMessage} />
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {hasRowErrors && entries.length === 0 ? (
        <FormFieldError message={t("emptyError")} />
      ) : null}
      <div>
        <OmmButton
          type="button"
          variant="secondary"
          size="md"
          onClick={onAddRow}
          disabled={disabled || !canAddRow}
        >
          {t("addRowButton")}
        </OmmButton>
      </div>
    </div>
  );
}
