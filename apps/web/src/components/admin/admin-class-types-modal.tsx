"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import {
  ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { AdminClassTypesDeleteDialog } from "@/components/admin/admin-class-types-delete-dialog";
import {
  AdminClassTypesEditor,
  type ClassTypeEditorMode,
  type ClassTypeFormState,
} from "@/components/admin/admin-class-types-editor";
import { EditActionButton } from "@/components/ui/edit-action-button";
import { DeleteActionButton } from "@/components/ui/delete-action-button";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
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

type AdminSessionClassTypeRef = {
  classType: { id: string };
};

type AdminClassTypesModalProps = {
  isOpen: boolean;
  classTypes: readonly AdminClassTypeRow[];
  sessionCountByTypeId: Readonly<Record<string, number>>;
  onClose: () => void;
  onChanged: (types: AdminClassTypeRow[]) => void;
  /** Opens the editor for this type when the modal is shown. */
  initialSelectedId?: string | null;
  /** Syncs the selected catalog type to the URL (or parent state) for refresh-safe edit mode. */
  onSelectedTypeIdChange?: (typeId: string | null) => void;
  /** When false, hides create actions (e.g. Packages edit-category flow). */
  allowCreate?: boolean;
  /** When false, hides delete (Packages must not remove shared Schedule class types). */
  allowDelete?: boolean;
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
  initialSelectedId = null,
  onSelectedTypeIdChange,
  allowCreate = true,
  allowDelete = true,
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
  const [pendingDeleteTargetId, setPendingDeleteTargetId] = useState<string | null>(null);
  const [resolvedSessionCounts, setResolvedSessionCounts] = useState<
    Record<string, number>
  >(() => ({ ...sessionCountByTypeId }));
  const submitLockRef = useRef(false);
  const onChangedRef = useRef(onChanged);
  const tRef = useRef(t);
  const fetchGenerationRef = useRef(0);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    onChangedRef.current = onChanged;
    tRef.current = t;
  }, [onChanged, t]);

  const slugPreview = useMemo(() => buildClassTypeSlugFromName(form.name), [form.name]);
  const selectedType = types.find((row) => row.id === selectedId) ?? null;
  const pendingDeleteType =
    types.find((row) => row.id === pendingDeleteTargetId) ?? null;
  const selectedSessionCount =
    selectedId !== null ? (resolvedSessionCounts[selectedId] ?? 0) : 0;
  const pendingDeleteSessionCount =
    pendingDeleteTargetId !== null
      ? (resolvedSessionCounts[pendingDeleteTargetId] ?? 0)
      : 0;

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
      return undefined;
    }
    let cancelled = false;
    queueMicrotask(() => {
      setResolvedSessionCounts({ ...sessionCountByTypeId });
    });
    void (async () => {
      try {
        const sessions = await apiFetch<AdminSessionClassTypeRef[]>(
          "/classes/admin/sessions",
        );
        if (cancelled) {
          return;
        }
        const counts: Record<string, number> = {};
        for (const session of sessions) {
          counts[session.classType.id] = (counts[session.classType.id] ?? 0) + 1;
        }
        setResolvedSessionCounts(counts);
      } catch {
        if (!cancelled) {
          setResolvedSessionCounts({ ...sessionCountByTypeId });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, sessionCountByTypeId]);

  useEffect(() => {
    if (!isOpen) {
      queueMicrotask(() => {
        setTypes(sortTypes(classTypes));
      });
    }
  }, [classTypes, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      fetchGenerationRef.current += 1;
      queueMicrotask(() => {
        setLoadState("idle");
      });
      return;
    }
    if (wasOpenRef.current) {
      return;
    }
    wasOpenRef.current = true;
    queueMicrotask(() => {
      setListFilter("");
      setPendingDelete(false);
      setPendingDeleteTargetId(null);
      setFieldErrors({});
      setError(null);
      setBanner(null);
      setTypes(sortTypes(classTypes));
      setLoadState("idle");

      const initialType =
        initialSelectedId !== null
          ? sortTypes(classTypes).find((type) => type.id === initialSelectedId) ?? null
          : null;

      if (initialType !== null) {
        setMode("edit");
        setSelectedId(initialType.id);
        setForm(formFromType(initialType));
      } else {
        setMode("idle");
        setSelectedId(null);
        setForm(emptyForm());
      }
    });
  }, [classTypes, initialSelectedId, isOpen]);

  useEffect(() => {
    if (banner === null) {
      return undefined;
    }
    const handle = window.setTimeout(() => setBanner(null), 5000);
    return () => window.clearTimeout(handle);
  }, [banner]);

  if (!isOpen) {
    return null;
  }

  function beginCreate() {
    setMode("create");
    setSelectedId(null);
    setForm(emptyForm());
    setFieldErrors({});
    setError(null);
    onSelectedTypeIdChange?.(null);
  }

  function beginEdit(type: AdminClassTypeRow) {
    setMode("edit");
    setSelectedId(type.id);
    setForm(formFromType(type));
    setFieldErrors({});
    setError(null);
    onSelectedTypeIdChange?.(type.id);
  }

  function resetEditor() {
    setMode("idle");
    setSelectedId(null);
    setForm(emptyForm());
    setFieldErrors({});
    setError(null);
    onSelectedTypeIdChange?.(null);
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

  function requestDelete(type: AdminClassTypeRow) {
    setPendingDeleteTargetId(type.id);
    setPendingDelete(true);
    setError(null);
  }

  function cancelDelete() {
    setPendingDelete(false);
    setPendingDeleteTargetId(null);
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
    if (pending || pendingDeleteTargetId === null || pendingDeleteType === null) {
      return;
    }
    if (pendingDeleteSessionCount > 0) {
      setError(t("deleteBlocked", { count: pendingDeleteSessionCount }));
      setPendingDelete(false);
      setPendingDeleteTargetId(null);
      return;
    }

    setPending(true);
    setError(null);
    try {
      await apiFetch(`/classes/types/${pendingDeleteTargetId}`, { method: "DELETE" });
      const nextTypes = types.filter((row) => row.id !== pendingDeleteTargetId);
      setTypes(nextTypes);
      onChanged(nextTypes);
      setBanner(t("messages.deleteSuccess"));
      setPendingDelete(false);
      setPendingDeleteTargetId(null);
      if (selectedId === pendingDeleteTargetId) {
        resetEditor();
      }
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : t("messages.genericError"),
      );
      setPendingDelete(false);
      setPendingDeleteTargetId(null);
    } finally {
      setPending(false);
    }
  }

  const listBusy = loadState === "loading";
  const showSearch = types.length >= LIST_SEARCH_MIN_COUNT;

  return (
    <>
      <OmmDrawerPortal
        isOpen
        onClose={onClose}
        closeDisabled={pending || pendingDelete}
        backdropAriaLabel={t("modalBackdropClose")}
        ariaLabelledBy={titleId}
        overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
        panelClassName={ADMIN_WIDE_DRAWER_PANEL_CLASS}
      >
          <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
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
                className={`shrink-0 ${ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS} disabled:opacity-50`}
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
                {allowCreate ? (
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
                ) : null}
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
                    onDelete={
                      allowDelete
                        ? () => {
                            if (selectedType !== null) {
                              requestDelete(selectedType);
                            }
                          }
                        : undefined
                    }
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
                    const count = resolvedSessionCounts[type.id] ?? 0;
                    const description = type.description?.trim();
                    const updatedLabel =
                      type.updatedAt !== undefined
                        ? formatDateForUi(type.updatedAt)
                        : null;
                    return (
                      <li key={type.id}>
                        <div
                          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${
                            isActive
                              ? "border-sage-700/20 bg-sage-800 text-white shadow-[0_16px_34px_-22px_rgba(45,40,35,0.55)]"
                              : "border-white/70 bg-white/75 text-sage-800"
                          }`}
                        >
                          <div className="min-w-0 flex-1 text-left">
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
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {allowDelete ? (
                              <DeleteActionButton
                                ariaLabel={t("deleteButtonAria", { name: type.name })}
                                title={t("deleteButtonAria", { name: type.name })}
                                onClick={() => requestDelete(type)}
                                disabled={listBusy || pending}
                                className={
                                  isActive
                                    ? "border-white/40 bg-red-500/20 text-white hover:bg-red-500/30 hover:text-white focus-visible:ring-white/50 focus-visible:ring-offset-sage-800"
                                    : undefined
                                }
                              />
                            ) : null}
                            <EditActionButton
                              ariaLabel={t("editButtonAria", { name: type.name })}
                              title={t("editButtonAria", { name: type.name })}
                              onClick={() => beginEdit(type)}
                              disabled={listBusy || pending}
                              className={
                                isActive
                                  ? "shrink-0 border-white/40 bg-white/15 text-white hover:bg-white/25 hover:text-white focus-visible:ring-white/50 focus-visible:ring-offset-sage-800"
                                  : "shrink-0"
                              }
                            />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
      </OmmDrawerPortal>

      {pendingDelete && pendingDeleteType !== null ? (
        <AdminClassTypesDeleteDialog
          typeName={pendingDeleteType.name}
          sessionCount={pendingDeleteSessionCount}
          pending={pending}
          onCancel={cancelDelete}
          onConfirm={() => {
            void confirmDelete();
          }}
        />
      ) : null}
    </>
  );
}
