"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  createEmptyTypeSessionEntry,
  entriesFromPackage,
  validateTypeSessionEntries,
  type PackageTypeSessionFormEntry,
} from "@/components/admin/admin-package-type-sessions.util";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_PACKAGE_SESSIONS,
  MIN_PACKAGE_SESSIONS,
  OMMM_INPUT_NUMBER_CLASS,
  preventNumberArrowStep,
} from "@/components/admin/admin-package-form-utils";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { adminChrome } from "@/components/admin/admin-chrome";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmFormDropdown } from "@/components/ui/omm-select-dropdown";
import { ApiError, apiFetch } from "@/lib/api";

type AdminPackageTypeSessionsModalProps = {
  isOpen: boolean;
  packageRow: AdminPackageRow | null;
  classTypeOptions: readonly { id: string; name: string }[];
  onClose: () => void;
  onSaved: (saved: AdminPackageRow) => void;
};

export function AdminPackageTypeSessionsModal({
  isOpen,
  packageRow,
  classTypeOptions,
  onClose,
  onSaved,
}: AdminPackageTypeSessionsModalProps) {
  const t = useTranslations("adminPages.packages.typeSessionsModal");
  const resetKey =
    isOpen && packageRow !== null ? `${packageRow.id}:edit` : "closed";
  const [entries, setEntries] = useState<PackageTypeSessionFormEntry[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);

  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    if (isOpen && packageRow !== null) {
      setEntries(entriesFromPackage(packageRow));
      setError(null);
      setPending(false);
    }
  }

  const dropdownOptions = useMemo(
    () =>
      classTypeOptions.map((classType) => ({
        value: classType.id,
        label: classType.name,
      })),
    [classTypeOptions],
  );

  function updateEntry(
    entryId: string,
    patch: Partial<
      Pick<PackageTypeSessionFormEntry, "classTypeId" | "sessionCount" | "description">
    >,
  ): void {
    setEntries((current) =>
      current.map((entry) => (entry.id === entryId ? { ...entry, ...patch } : entry)),
    );
  }

  function addEntry(): void {
    setEntries((current) => [...current, createEmptyTypeSessionEntry()]);
  }

  function removeEntry(entryId: string): void {
    setEntries((current) => current.filter((entry) => entry.id !== entryId));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pending || packageRow === null) {
      return;
    }
    const validation = validateTypeSessionEntries(entries);
    if (!validation.ok) {
      setError(
        validation.error === "duplicateType"
          ? t("duplicateTypeError")
          : validation.error === "missingType"
            ? t("missingTypeError")
            : validation.error === "invalidSessionCount"
              ? t("invalidSessionCountError")
              : validation.error === "empty"
                ? t("emptyError")
                : t("invalidEntries"),
      );
      return;
    }
    const payload = validation.payload;
    setPending(true);
    setError(null);
    try {
      const saved = await apiFetch<AdminPackageRow>(`/packages/plans/${packageRow.id}`, {
        method: "PATCH",
        body: JSON.stringify({ typeSessionAllocations: payload }),
      });
      onSaved(saved);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error && err.message.trim().length > 0) {
        setError(err.message);
      } else {
        setError(t("genericError"));
      }
    } finally {
      setPending(false);
    }
  }

  if (!isOpen || packageRow === null) {
    return null;
  }

  return (
    <OmmModalPortal
      isOpen={isOpen}
      onClose={onClose}
      backdropAriaLabel={t("backdropClose")}
      useOverlayPortalRoot
      overlayClassName="ommm-modal-overlay z-[130]"
      panelClassName="mt-auto flex max-h-[92vh] w-full max-w-[min(640px,95vw)] flex-col overflow-hidden rounded-t-[28px] border border-white/60 bg-white/85 shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)] backdrop-blur-md sm:mt-0 sm:rounded-[28px]"
    >
      <form onSubmit={(event) => void onSubmit(event)} className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-white/60 bg-white/55 px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <h2 className={adminChrome.panelHeading}>{t("title")}</h2>
            <p className="ommm-body-muted mt-1 text-sm">{t("description")}</p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-full p-2 text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            aria-label={t("closeAria")}
            onClick={onClose}
            disabled={pending}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              className="h-5 w-5"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-7">
          {entries.length === 0 ? (
            <p className="text-sm text-sage-600">{t("formEmpty")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {entries.map((entry, index) => (
                <li
                  key={entry.id}
                  className="grid gap-3 rounded-[20px] border border-[rgba(151,144,124,0.28)] bg-white/75 p-4 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-end"
                >
                  <div className="flex min-w-0 flex-col gap-3 sm:col-span-2 sm:grid sm:grid-cols-[minmax(0,1fr)_9rem] sm:items-end sm:gap-3">
                    <label className="flex min-w-0 flex-col gap-1.5">
                      <span className="ommm-label text-xs uppercase tracking-wide">
                        {t("fieldType")}
                      </span>
                      <OmmFormDropdown
                        value={entry.classTypeId}
                        ariaLabel={t("fieldType")}
                        placeholderLabel={t("fieldTypePlaceholder")}
                        options={dropdownOptions}
                        onChange={(nextValue) =>
                          updateEntry(entry.id, { classTypeId: nextValue })
                        }
                        disabled={pending}
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
                        disabled={pending}
                        required
                      />
                    </label>
                    <label className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
                      <span className="ommm-label text-xs uppercase tracking-wide">
                        {t("fieldDescription")}
                      </span>
                      <textarea
                        className="ommm-input min-h-[4.5rem] resize-y"
                        value={entry.description}
                        onChange={(event) =>
                          updateEntry(entry.id, { description: event.target.value })
                        }
                        placeholder={t("fieldDescriptionPlaceholder")}
                        disabled={pending}
                        maxLength={MAX_DESCRIPTION_LENGTH}
                        rows={2}
                      />
                    </label>
                  </div>
                  <div className="flex items-end justify-end sm:justify-center">
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sage-600 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 disabled:opacity-50"
                      aria-label={t("removeRowAria", { index: index + 1 })}
                      onClick={() => removeEntry(entry.id)}
                      disabled={pending}
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
            <OmmButton
              type="button"
              variant="secondary"
              size="md"
              onClick={addEntry}
              disabled={pending}
            >
              {t("addRowButton")}
            </OmmButton>
          </div>

          {error !== null ? (
            <p className="app-alert-warn text-sm" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-white/60 bg-white/85 px-5 py-4 backdrop-blur-sm sm:rounded-b-[28px] sm:px-7">
          <OmmButton type="button" variant="secondary" size="md" onClick={onClose} disabled={pending}>
            {t("cancelButton")}
          </OmmButton>
          <OmmButton type="submit" variant="primary" size="md" disabled={pending}>
            {pending ? t("savingButton") : t("saveButton")}
          </OmmButton>
        </div>
      </form>
    </OmmModalPortal>
  );
}
