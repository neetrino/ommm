"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminClassTypesDeleteDialog } from "@/components/admin/admin-class-types-delete-dialog";
import {
  AdminClassTypesEditor,
  type ClassTypeEditorMode,
  type ClassTypeFormState,
} from "@/components/admin/admin-class-types-editor";
import { OmmButton } from "@/components/ui/omm-button";
import { PlusIcon } from "@/components/ui/plus-icon";
import { ApiError, apiFetch } from "@/lib/api";
import { buildClassTypeSlugFromName } from "@/lib/class-type-slug";
import { formatDateForUi } from "@/lib/date-display";

export type AdminClassTypeRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type AdminClassTypesModalProps = {
  isOpen: boolean;
  classTypes: readonly AdminClassTypeRow[];
  sessionCountByTypeId: Readonly<Record<string, number>>;
  onClose: () => void;
  onChanged: (types: AdminClassTypeRow[]) => void;
};

type LoadState = "idle" | "loading" | "error";

type FieldErrors = {
  name?: string;
  description?: string;
};

const LIST_SEARCH_MIN_COUNT = 6;
const MAX_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 4000;

function emptyForm(): ClassTypeFormState {
  return { name: "", description: "" };
}

function formFromType(type: AdminClassTypeRow): ClassTypeFormState {
  return {
    name: type.name,
    description: type.description ?? "",
  };
}

function sortTypes(types: readonly AdminClassTypeRow[]): AdminClassTypeRow[] {
  return [...types].sort((left, right) => left.name.localeCompare(right.name));
}

function truncateDescription(value: string, max = 72): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1)}…`;
}

function ModalCloseIcon() {
  return (
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
  );
}

function ListSkeleton() {
  return (
    <ul className="space-y-2" aria-hidden>
      {Array.from({ length: 4 }, (_, index) => (
        <li
          key={index}
          className="h-[4.5rem] animate-pulse rounded-2xl border border-white/70 bg-white/60"
        />
      ))}
    </ul>
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
  const descId = useId();
  const [types, setTypes] = useState<AdminClassTypeRow[]>(() => sortTypes(classTypes));
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [listFilter, setListFilter] = useState("");
  const [mode, setMode] = useState<ClassTypeEditorMode>("idle");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<ClassTypeFormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const submitLockRef = useRef(false);
  const onChangedRef = useRef(onChanged);
  onChangedRef.current = onChanged;
  const tRef = useRef(t);
  tRef.current = t;
  const fetchGenerationRef = useRef(0);
  const wasOpenRef = useRef(false);

  const slugPreview = useMemo(() => buildClassTypeSlugFromName(form.name), [form.name]);
  const selectedType = types.find((row) => row.id === selectedId) ?? null;
  const selectedSessionCount =
    selectedId !== null ? (sessionCountByTypeId[selectedId] ?? 0) : 0;

  const filteredTypes = useMemo(() => {
    const query = listFilter.trim().toLowerCase();
    if (query.length === 0) {
      return types;
    }
    return types.filter((type) => {
      const haystack = `${type.name} ${type.slug} ${type.description ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [listFilter, types]);

  const refreshTypes = useCallback(async () => {
    const generation = fetchGenerationRef.current + 1;
    fetchGenerationRef.current = generation;
    setLoadState("loading");
    setError(null);
    try {
      const fetched = await apiFetch<AdminClassTypeRow[]>("/classes/types");
      if (fetchGenerationRef.current !== generation) {
        return;
      }
      setTypes(sortTypes(fetched));
      setLoadState("idle");
    } catch (requestError) {
      if (fetchGenerationRef.current !== generation) {
        return;
      }
      setLoadState("error");
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : tRef.current("messages.genericError"),
      );
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setTypes(sortTypes(classTypes));
    }
  }, [classTypes, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      fetchGenerationRef.current += 1;
      setLoadState("idle");
      return;
    }
    if (wasOpenRef.current) {
      return;
    }
    wasOpenRef.current = true;
    setMode("idle");
    setSelectedId(null);
    setForm(emptyForm());
    setFieldErrors({});
    setError(null);
    setBanner(null);
    setListFilter("");
    setPendingDelete(false);
    setTypes(sortTypes(classTypes));
    setLoadState("idle");
  }, [isOpen, classTypes]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending && !pendingDelete) {
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, pending, pendingDelete]);

  useEffect(() => {
    if (banner === null) {
      return undefined;
    }
    const handle = window.setTimeout(() => setBanner(null), 5000);
    return () => window.clearTimeout(handle);
  }, [banner]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !portalReady) {
    return null;
  }

  function beginCreate() {
    setMode("create");
    setSelectedId(null);
    setForm(emptyForm());
    setFieldErrors({});
    setError(null);
  }

  function beginEdit(type: AdminClassTypeRow) {
    setMode("edit");
    setSelectedId(type.id);
    setForm(formFromType(type));
    setFieldErrors({});
    setError(null);
  }

  function resetEditor() {
    setMode("idle");
    setSelectedId(null);
    setForm(emptyForm());
    setFieldErrors({});
    setError(null);
  }

  function validateNameFor(formState: ClassTypeFormState): string | undefined {
    const trimmedName = formState.name.trim();
    if (trimmedName.length === 0) {
      return t("nameRequired");
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      return t("nameTooLong");
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
    return undefined;
  }

  function validateDescriptionFor(formState: ClassTypeFormState): string | undefined {
    if (formState.description.trim().length > MAX_DESCRIPTION_LENGTH) {
      return t("descriptionTooLong");
    }
    return undefined;
  }

  function validateForm(): boolean {
    const nextErrors: FieldErrors = {
      name: validateNameFor(form),
      description: validateDescriptionFor(form),
    };
    setFieldErrors(nextErrors);
    return nextErrors.name === undefined && nextErrors.description === undefined;
  }

  async function saveType(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitLockRef.current || !validateForm()) {
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
      if (mode === "create") {
        resetEditor();
      } else {
        beginEdit(saved);
      }
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

  async function confirmDelete() {
    if (pending || selectedId === null || selectedType === null) {
      return;
    }
    if (selectedSessionCount > 0) {
      setError(t("deleteBlocked", { count: selectedSessionCount }));
      setPendingDelete(false);
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
      setPendingDelete(false);
      resetEditor();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : t("messages.genericError"),
      );
      setPendingDelete(false);
    } finally {
      setPending(false);
    }
  }

  const listBusy = loadState === "loading";
  const showSearch = types.length >= LIST_SEARCH_MIN_COUNT;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
        role="presentation"
      >
        <button
          type="button"
          className="absolute inset-0 z-0 bg-sage-950/45 backdrop-blur-[2px] transition-opacity"
          onClick={() => {
            if (!pending && !pendingDelete) {
              onClose();
            }
          }}
          aria-label={t("modalBackdropClose")}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          className={`relative z-10 mt-auto flex max-h-[min(92vh,760px)] w-full flex-col overflow-hidden rounded-t-[28px] border border-white/60 bg-white/90 shadow-[0_24px_60px_-28px_rgba(45,40,35,0.35)] backdrop-blur-md sm:mt-0 sm:rounded-[24px] ${
            mode === "idle" ? "max-w-2xl" : "max-w-3xl"
          }`}
        >
          <header className="shrink-0 border-b border-white/60 px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className={adminChrome.panelHeading}>
                  {t("modalTitle")}
                </h2>
                <p id={descId} className="ommm-body-muted mt-1 text-sm">
                  {t("modalDescription")}
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full p-2 text-sage-500 transition-colors hover:bg-sand-50 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/40 disabled:opacity-50"
                onClick={onClose}
                disabled={pending || pendingDelete}
                aria-label={t("modalCloseAria")}
              >
                <ModalCloseIcon />
              </button>
            </div>
            {banner !== null ? (
              <p
                className="mt-3 rounded-xl border border-mint-200 bg-mint-50 px-3 py-2 text-sm text-sage-800"
                role="status"
              >
                {banner}
              </p>
            ) : null}
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <section className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sage-500">
                  {t("listHeading")}
                  {types.length > 0 ? (
                    <span className="ml-1 text-sage-400">({types.length})</span>
                  ) : null}
                </p>
                <OmmButton
                  size="sm"
                  variant="secondary"
                  className="gap-1.5"
                  onClick={beginCreate}
                  disabled={listBusy || pending}
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  {t("addButton")}
                </OmmButton>
              </div>

              {mode !== "idle" ? (
                <div className="mb-4 shrink-0 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-[0_12px_28px_-24px_rgba(45,40,35,0.2)]">
                  <AdminClassTypesEditor
                    mode={mode}
                    form={form}
                    slugPreview={slugPreview}
                    selectedSlug={selectedType?.slug ?? null}
                    createdAtLabel={
                      selectedType?.createdAt !== undefined
                        ? formatDateForUi(selectedType.createdAt)
                        : null
                    }
                    updatedAtLabel={
                      selectedType?.updatedAt !== undefined
                        ? formatDateForUi(selectedType.updatedAt)
                        : null
                    }
                    selectedSessionCount={selectedSessionCount}
                    fieldErrors={fieldErrors}
                    pending={pending}
                    error={loadState === "error" ? null : error}
                    onFormChange={(next) => {
                      setForm(next);
                      setFieldErrors((current) => ({
                        name:
                          current.name !== undefined ? validateNameFor(next) : undefined,
                        description:
                          current.description !== undefined
                            ? validateDescriptionFor(next)
                            : undefined,
                      }));
                    }}
                    onNameBlur={() =>
                      setFieldErrors((current) => ({ ...current, name: validateNameFor(form) }))
                    }
                    onDescriptionBlur={() =>
                      setFieldErrors((current) => ({
                        ...current,
                        description: validateDescriptionFor(form),
                      }))
                    }
                    onReset={resetEditor}
                    onDelete={() => setPendingDelete(true)}
                    onSubmit={(event) => {
                      void saveType(event);
                    }}
                  />
                </div>
              ) : null}

              {showSearch ? (
                <input
                  className="ommm-input mb-3 h-9 text-sm"
                  value={listFilter}
                  onChange={(event) => setListFilter(event.target.value)}
                  placeholder={t("listSearchPlaceholder")}
                  aria-label={t("listSearchPlaceholder")}
                  disabled={listBusy}
                />
              ) : null}

              {loadState === "error" ? (
                <div className="rounded-2xl border border-red-200/80 bg-red-50 px-4 py-8 text-center">
                  <p className="font-medium text-red-900">{t("loadErrorTitle")}</p>
                  <p className="mt-1 text-sm text-red-800">{error ?? t("messages.genericError")}</p>
                  <OmmButton
                    size="sm"
                    variant="primary"
                    className="mt-4"
                    onClick={() => {
                      void refreshTypes();
                    }}
                  >
                    {t("retryButton")}
                  </OmmButton>
                </div>
              ) : listBusy ? (
                <ListSkeleton />
              ) : types.length === 0 ? (
                mode === "idle" ? (
                  <div className="rounded-2xl border border-dashed border-white/80 bg-white/60 px-4 py-10 text-center">
                    <p className="font-medium text-sage-800">{t("emptyTitle")}</p>
                    <p className="mt-1 text-sm text-sage-500">{t("emptyBody")}</p>
                  </div>
                ) : null
              ) : filteredTypes.length === 0 ? (
                <p className="rounded-2xl border border-white/70 bg-white/60 px-4 py-8 text-center text-sm text-sage-500">
                  {t("listNoMatches")}
                </p>
              ) : (
                <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                  {filteredTypes.map((type) => {
                    const isActive = selectedId === type.id && mode === "edit";
                    const count = sessionCountByTypeId[type.id] ?? 0;
                    const description = type.description?.trim();
                    const updatedLabel =
                      type.updatedAt !== undefined
                        ? formatDateForUi(type.updatedAt)
                        : null;
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
                          {description ? (
                            <span
                              className={`mt-1 block text-sm line-clamp-2 ${
                                isActive ? "text-white/80" : "text-sage-600"
                              }`}
                            >
                              {truncateDescription(description)}
                            </span>
                          ) : null}
                          <span
                            className={`mt-1.5 block text-xs ${
                              isActive ? "text-white/70" : "text-sage-500"
                            }`}
                          >
                            {type.slug}
                            {" · "}
                            {count > 0
                              ? t("sessionCount", { count })
                              : t("sessionCountNone")}
                            {updatedLabel ? ` · ${t("updatedLabel", { date: updatedLabel })}` : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>

      {pendingDelete && selectedType !== null ? (
        <AdminClassTypesDeleteDialog
          typeName={selectedType.name}
          sessionCount={selectedSessionCount}
          pending={pending}
          onCancel={() => setPendingDelete(false)}
          onConfirm={() => {
            void confirmDelete();
          }}
        />
      ) : null}
    </>,
    document.body,
  );
}
