"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import { OmmButton } from "@/components/ui/omm-button";
import { PlusIcon } from "@/components/ui/plus-icon";
import { ApiError, apiFetch } from "@/lib/api";
import { buildClassTypeSlugFromName } from "@/lib/class-type-slug";

const MAX_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 4000;

export type AdminClassTypeRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

type AdminClassTypesModalProps = {
  isOpen: boolean;
  classTypes: readonly AdminClassTypeRow[];
  sessionCountByTypeId: Readonly<Record<string, number>>;
  onClose: () => void;
  onChanged: (types: AdminClassTypeRow[]) => void;
};

type EditorMode = "idle" | "create" | "edit";

type FormState = {
  name: string;
  description: string;
};

function emptyForm(): FormState {
  return { name: "", description: "" };
}

function formFromType(type: AdminClassTypeRow): FormState {
  return {
    name: type.name,
    description: type.description ?? "",
  };
}

function sortTypes(types: readonly AdminClassTypeRow[]): AdminClassTypeRow[] {
  return [...types].sort((left, right) => left.name.localeCompare(right.name));
}

function LayersGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

export function AdminClassTypesModal({
  isOpen,
  classTypes,
  sessionCountByTypeId,
  onClose,
  onChanged,
}: AdminClassTypesModalProps) {
  const t = useTranslations("adminPages.classes.classTypes");
  const titleId = useId();
  const [types, setTypes] = useState<AdminClassTypeRow[]>(() => sortTypes(classTypes));
  const [mode, setMode] = useState<EditorMode>("idle");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const submitLockRef = useRef(false);

  const slugPreview = useMemo(() => buildClassTypeSlugFromName(form.name), [form.name]);
  const selectedType = types.find((row) => row.id === selectedId) ?? null;
  const selectedSessionCount =
    selectedId !== null ? (sessionCountByTypeId[selectedId] ?? 0) : 0;

  useEffect(() => {
    setTypes(sortTypes(classTypes));
  }, [classTypes]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setMode("idle");
    setSelectedId(null);
    setForm(emptyForm());
    setError(null);
    setBanner(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, pending]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  function beginCreate() {
    setMode("create");
    setSelectedId(null);
    setForm(emptyForm());
    setError(null);
  }

  function beginEdit(type: AdminClassTypeRow) {
    setMode("edit");
    setSelectedId(type.id);
    setForm(formFromType(type));
    setError(null);
  }

  function resetEditor() {
    setMode("idle");
    setSelectedId(null);
    setForm(emptyForm());
    setError(null);
  }

  function validateForm(): string | null {
    const trimmedName = form.name.trim();
    if (trimmedName.length === 0) {
      return t("nameRequired");
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      return t("nameTooLong");
    }
    if (form.description.trim().length > MAX_DESCRIPTION_LENGTH) {
      return t("descriptionTooLong");
    }
    const slug = buildClassTypeSlugFromName(trimmedName);
    if (slug.length === 0) {
      return t("slugInvalid");
    }
    const duplicate = types.some(
      (row) =>
        row.id !== selectedId &&
        row.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );
    if (duplicate) {
      return t("nameDuplicate");
    }
    return null;
  }

  async function saveType(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitLockRef.current) {
      return;
    }
    const validationError = validateForm();
    if (validationError !== null) {
      setError(validationError);
      return;
    }

    const trimmedName = form.name.trim();
    const trimmedDescription = form.description.trim();
    const slug = buildClassTypeSlugFromName(trimmedName);
    submitLockRef.current = true;
    setPending(true);
    setError(null);

    try {
      const saved =
        mode === "edit" && selectedId !== null
          ? await apiFetch<AdminClassTypeRow>(`/classes/types/${selectedId}`, {
              method: "PATCH",
              body: JSON.stringify({
                name: trimmedName,
                slug,
                description:
                  trimmedDescription.length > 0 ? trimmedDescription : null,
              }),
            })
          : await apiFetch<AdminClassTypeRow>("/classes/types", {
              method: "POST",
              body: JSON.stringify({
                name: trimmedName,
                slug,
                description:
                  trimmedDescription.length > 0 ? trimmedDescription : undefined,
              }),
            });

      const nextTypes = sortTypes(
        mode === "edit"
          ? types.map((row) => (row.id === saved.id ? saved : row))
          : [...types, saved],
      );
      setTypes(nextTypes);
      onChanged(nextTypes);
      setBanner(mode === "edit" ? t("messages.updateSuccess") : t("messages.createSuccess"));
      beginEdit(saved);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : t("messages.genericError"),
      );
    } finally {
      setPending(false);
      submitLockRef.current = false;
    }
  }

  async function removeSelected() {
    if (pending || selectedId === null || selectedType === null) {
      return;
    }
    if (selectedSessionCount > 0) {
      setError(t("deleteBlocked", { count: selectedSessionCount }));
      return;
    }
    if (!window.confirm(t("deleteConfirm", { name: selectedType.name }))) {
      return;
    }

    setPending(true);
    setError(null);
    try {
      await apiFetch(`/classes/types/${selectedId}`, { method: "DELETE" });
      const nextTypes = types.filter((row) => row.id !== selectedId);
      setTypes(nextTypes);
      onChanged(nextTypes);
      setBanner(t("messages.deleteSuccess"));
      resetEditor();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : t("messages.genericError"),
      );
    } finally {
      setPending(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-sage-950/40 p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0"
        onClick={() => {
          if (!pending) {
            onClose();
          }
        }}
        aria-label={t("modalBackdropClose")}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[28px] border border-white/60 bg-white shadow-[0_28px_80px_-32px_rgba(45,40,35,0.45)] sm:rounded-[28px]"
      >
        <header className="border-b border-white/60 bg-white/90 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sage-700/10 bg-sage-800 text-white shadow-[0_14px_28px_-18px_rgba(45,40,35,0.55)]">
                <LayersGlyph className="h-5 w-5" />
              </span>
              <div>
                <h2 id={titleId} className="font-serif text-xl font-semibold text-sage-900">
                  {t("modalTitle")}
                </h2>
                <p className="mt-1 text-sm text-sage-500">{t("modalDescription")}</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-full p-2 text-sage-500 hover:bg-sand-50"
              onClick={onClose}
              disabled={pending}
              aria-label={t("modalCloseAria")}
            >
              ×
            </button>
          </div>
          {banner !== null ? (
            <p className="mt-3 rounded-xl border border-mint-200 bg-mint-50 px-3 py-2 text-sm text-sage-800">
              {banner}
            </p>
          ) : null}
        </header>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <section className="border-b border-white/60 bg-white/55 p-4 lg:border-b-0 lg:border-r">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sage-500">
                {t("listHeading")}
              </p>
              <OmmButton size="sm" variant="secondary" className="gap-1.5" onClick={beginCreate}>
                <PlusIcon className="h-3.5 w-3.5" />
                {t("addButton")}
              </OmmButton>
            </div>

            {types.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/80 bg-white/60 px-4 py-10 text-center">
                <p className="font-medium text-sage-800">{t("emptyTitle")}</p>
                <p className="mt-1 text-sm text-sage-500">{t("emptyBody")}</p>
                <OmmButton size="sm" variant="primary" className="mt-4 gap-1.5" onClick={beginCreate}>
                  <PlusIcon className="h-3.5 w-3.5" />
                  {t("addButton")}
                </OmmButton>
              </div>
            ) : (
              <ul className="max-h-[min(52vh,28rem)] space-y-2 overflow-y-auto pr-1">
                {types.map((type) => {
                  const isActive = selectedId === type.id && mode === "edit";
                  const count = sessionCountByTypeId[type.id] ?? 0;
                  return (
                    <li key={type.id}>
                      <button
                        type="button"
                        onClick={() => beginEdit(type)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                          isActive
                            ? "border-sage-700/20 bg-sage-800 text-white shadow-[0_16px_34px_-22px_rgba(45,40,35,0.55)]"
                            : "border-white/70 bg-white/75 text-sage-800 hover:-translate-y-0.5 hover:bg-white"
                        }`}
                      >
                        <span className="block font-medium">{type.name}</span>
                        <span
                          className={`mt-1 block text-xs ${isActive ? "text-white/70" : "text-sage-500"}`}
                        >
                          {type.slug}
                          {count > 0
                            ? ` · ${t("sessionCount", { count })}`
                            : ` · ${t("sessionCountNone")}`}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="flex min-h-[18rem] flex-col bg-white/80 p-4 sm:p-5">
            {mode === "idle" ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/80 bg-white/55 px-6 py-10 text-center">
                <LayersGlyph className="h-8 w-8 text-sage-400" />
                <p className="mt-4 text-sm text-sage-600">{t("formHint")}</p>
                <OmmButton size="sm" variant="primary" className="mt-4 gap-1.5" onClick={beginCreate}>
                  <PlusIcon className="h-3.5 w-3.5" />
                  {t("addButton")}
                </OmmButton>
              </div>
            ) : (
              <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => { void saveType(event); }}>
                <div className="mb-4">
                  <h3 className={adminChrome.panelHeading}>
                    {mode === "create" ? t("formCreateTitle") : t("formEditTitle")}
                  </h3>
                  {mode === "edit" && selectedType !== null ? (
                    <p className="mt-1 text-xs text-sage-500">{selectedType.slug}</p>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldName")}</span>
                    <input
                      className="ommm-input"
                      value={form.name}
                      maxLength={MAX_NAME_LENGTH}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      disabled={pending}
                      required
                    />
                  </label>

                  <div className="flex flex-col gap-1.5">
                    <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldSlug")}</span>
                    <p className="ommm-input bg-white/40 text-sage-600">{slugPreview || "—"}</p>
                  </div>

                  <label className="flex flex-col gap-1.5">
                    <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldDescription")}</span>
                    <textarea
                      className="ommm-input min-h-28"
                      value={form.description}
                      maxLength={MAX_DESCRIPTION_LENGTH}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, description: event.target.value }))
                      }
                      disabled={pending}
                    />
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
                        onClick={() => {
                          void removeSelected();
                        }}
                      >
                        {t("deleteButton")}
                      </OmmButton>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <OmmButton
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={resetEditor}
                    >
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
            )}
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
