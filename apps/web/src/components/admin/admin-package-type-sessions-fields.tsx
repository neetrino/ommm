"use client";

import { useTranslations } from "next-intl";
import {
  MIN_PACKAGE_SESSIONS,
  MAX_PACKAGE_SESSIONS,
  OMMM_INPUT_NUMBER_CLASS,
  preventNumberArrowStep,
} from "@/components/admin/admin-package-form-utils";
import type { PackageTypeSessionFormEntry } from "@/components/admin/admin-package-type-sessions.util";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmFormDropdown } from "@/components/ui/omm-select-dropdown";

type AdminPackageTypeSessionsFieldsProps = {
  entries: readonly PackageTypeSessionFormEntry[];
  classTypeOptions: readonly { id: string; name: string }[];
  disabled?: boolean;
  onChange: (entries: PackageTypeSessionFormEntry[]) => void;
  onAddRow: () => void;
  onRemoveRow: (entryId: string) => void;
};

export function AdminPackageTypeSessionsFields({
  entries,
  classTypeOptions,
  disabled = false,
  onChange,
  onAddRow,
  onRemoveRow,
}: AdminPackageTypeSessionsFieldsProps) {
  const t = useTranslations("adminPages.packages.typeSessionsForm");

  const dropdownOptions = classTypeOptions.map((classType) => ({
    value: classType.id,
    label: classType.name,
  }));

  function updateEntry(
    entryId: string,
    patch: Partial<Pick<PackageTypeSessionFormEntry, "classTypeId" | "sessionCount">>,
  ): void {
    onChange(
      entries.map((entry) => (entry.id === entryId ? { ...entry, ...patch } : entry)),
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.length === 0 ? (
        <p className="text-sm text-sage-600">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry, index) => (
            <li
              key={entry.id}
              className="grid gap-3 rounded-[20px] border border-[rgba(151,144,124,0.28)] bg-white/75 p-4 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-end"
            >
              <label className="flex min-w-0 flex-col gap-1.5">
                <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldType")}</span>
                <OmmFormDropdown
                  value={entry.classTypeId}
                  ariaLabel={t("fieldType")}
                  placeholderLabel={t("fieldTypePlaceholder")}
                  options={dropdownOptions}
                  onChange={(nextValue) => updateEntry(entry.id, { classTypeId: nextValue })}
                  disabled={disabled}
                  name={`type-${entry.id}`}
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="ommm-label text-xs uppercase tracking-wide">
                  {t("fieldSessionCount")}
                </span>
                <input
                  type="number"
                  className={OMMM_INPUT_NUMBER_CLASS}
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
                  required
                />
              </label>
              <div className="flex items-end justify-end sm:justify-center">
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
            </li>
          ))}
        </ul>
      )}
      <div>
        <OmmButton type="button" variant="secondary" size="md" onClick={onAddRow} disabled={disabled}>
          {t("addRowButton")}
        </OmmButton>
      </div>
    </div>
  );
}
