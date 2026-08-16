"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import { AdminClassTypeDeleteConfirm } from "@/components/admin/admin-class-type-delete-confirm";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { OmmButton } from "@/components/ui/omm-button";
import { buildClassTypeSlugFromName } from "@/lib/class-type-slug";

export type AdminClassTypeRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type AdminTypesManagementProps = {
  initialTypes: readonly AdminClassTypeRow[];
  embedded?: boolean;
  onTypesChanged?: (types: readonly AdminClassTypeRow[]) => void;
};

type FormState = {
  name: string;
};

function emptyFormState(): FormState {
  return { name: "" };
}

function normalizeFormPayload(form: FormState): {
  name: string;
  slug: string;
} {
  const name = form.name.trim();
  const slug = buildClassTypeSlugFromName(name);
  return { name, slug };
}

export function AdminTypesManagement({
  initialTypes,
  embedded = false,
  onTypesChanged,
}: AdminTypesManagementProps) {
  const t = useTranslations("adminPages.classes.classTypes");
  const [rows, setRows] = useState<readonly AdminClassTypeRow[]>(initialTypes);
  const [prevInitialTypes, setPrevInitialTypes] = useState(initialTypes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyFormState);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  if (prevInitialTypes !== initialTypes) {
    setPrevInitialTypes(initialTypes);
    setRows(initialTypes);
  }

  function commitRows(next: readonly AdminClassTypeRow[]): void {
    setRows(next);
    onTypesChanged?.(next);
  }

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? null,
    [rows, selectedId],
  );

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized.length === 0) {
      return rows;
    }
    return rows.filter((row) => {
      return (
        row.name.toLowerCase().includes(normalized) ||
        row.slug.toLowerCase().includes(normalized)
      );
    });
  }, [query, rows]);

  function selectForEdit(row: AdminClassTypeRow): void {
    setSelectedId(row.id);
    setForm({ name: row.name });
    setError(null);
    setSuccess(null);
    setDeleteConfirmOpen(false);
  }

  function startCreate(): void {
    setSelectedId(null);
    setForm(emptyFormState());
    setError(null);
    setSuccess(null);
    setDeleteConfirmOpen(false);
  }

  async function submitForm(): Promise<void> {
    if (pending) {
      return;
    }
    const payload = normalizeFormPayload(form);
    if (payload.name.length === 0) {
      setError(t("nameRequired"));
      return;
    }

    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      if (selectedId === null) {
        const created = await apiFetch<AdminClassTypeRow>("/classes/types", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        commitRows(
          [...rows, created].sort((left, right) => left.name.localeCompare(right.name)),
        );
        setSelectedId(created.id);
        setForm({ name: created.name });
        setSuccess(t("messages.createSuccess"));
      } else {
        const updated = await apiFetch<AdminClassTypeRow>(`/classes/types/${selectedId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        commitRows(
          rows
            .map((row) => (row.id === updated.id ? updated : row))
            .sort((left, right) => left.name.localeCompare(right.name)),
        );
        setSuccess(t("messages.updateSuccess"));
      }
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : t("messages.genericError"),
      );
    } finally {
      setPending(false);
    }
  }

  async function deleteSelected(): Promise<void> {
    if (pending || selectedId === null) {
      return;
    }
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      await apiFetch(`/classes/types/${selectedId}`, { method: "DELETE" });
      commitRows(rows.filter((row) => row.id !== selectedId));
      setSelectedId(null);
      setForm(emptyFormState());
      setDeleteConfirmOpen(false);
      setSuccess(t("messages.deleteSuccess"));
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : t("messages.genericError"),
      );
    } finally {
      setPending(false);
    }
  }

  const searchField = (
    <input
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      placeholder={t("listSearchPlaceholder")}
      className="ommm-input w-full rounded-full"
    />
  );

  return (
    <div className={embedded ? "flex h-full min-h-0 flex-col gap-5" : "space-y-5"}>
      {embedded ? searchField : (
        <AdminPageHero title={t("modalTitle")} search={searchField} />
      )}

      {success ? (
        <p className="rounded-2xl border border-mint-200/80 bg-mint-50/90 px-4 py-3 text-sm text-sage-800">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-900">
          {error}
        </p>
      ) : null}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-stretch">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-sand-200/60 bg-white/70 p-2 shadow-[0_12px_32px_-28px_rgba(45,40,35,0.28)] sm:p-3">
          {filteredRows.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-sage-600">{t("listNoMatches")}</p>
          ) : (
            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto pe-1">
              {filteredRows.map((row) => {
                const active = row.id === selectedId;
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => selectForEdit(row)}
                      aria-current={active ? "true" : undefined}
                      className={`w-full rounded-2xl px-3.5 py-2.5 text-left text-sm transition-[background-color,box-shadow,border-color,color] ${
                        active
                          ? "border border-sand-300/90 bg-sand-50 font-medium text-sage-900 shadow-sm"
                          : "border border-transparent text-sage-700 hover:bg-white/90 hover:text-sage-900"
                      }`}
                    >
                      {row.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <form
          className="flex min-h-0 flex-col rounded-[24px] border border-sand-200/60 bg-white/80 p-5 shadow-[0_12px_32px_-28px_rgba(45,40,35,0.28)] sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            void submitForm();
          }}
        >
          <h2 className="font-serif text-xl font-normal text-sage-900">
            {selected ? t("formEditTitle") : t("formCreateTitle")}
          </h2>
          <div className="mt-5 space-y-3">
            <label className="block space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sage-500">
                {t("fieldName")}
              </span>
              <input
                className="ommm-input w-full"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder={t("fieldNamePlaceholder")}
                disabled={pending}
              />
            </label>
          </div>

          <div className="mt-auto flex flex-col gap-3 border-t border-sand-200/50 pt-5 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <OmmButton type="submit" variant="primary" size="sm" disabled={pending}>
                {pending ? t("savingButton") : selected ? t("saveButton") : t("createButton")}
              </OmmButton>
              {selected ? (
                <OmmButton type="button" variant="secondary" size="sm" disabled={pending} onClick={startCreate}>
                  {t("cancelButton")}
                </OmmButton>
              ) : null}
            </div>
            {selected ? (
              <OmmButton
                type="button"
                variant="danger"
                size="sm"
                className="sm:ms-auto"
                disabled={pending}
                onClick={() => setDeleteConfirmOpen(true)}
              >
                {t("deleteButton")}
              </OmmButton>
            ) : null}
          </div>
        </form>
      </div>

      <AdminClassTypeDeleteConfirm
        isOpen={deleteConfirmOpen && selected !== null}
        pending={pending}
        title={t("deleteDialog.title")}
        description={t("deleteDialog.description", { name: selected?.name ?? "" })}
        warning={t("deleteDialog.warning")}
        confirmLabel={
          pending ? t("deleteDialog.deletingButton") : t("deleteDialog.confirmButton")
        }
        cancelLabel={t("cancelButton")}
        backdropAriaLabel={t("modalBackdropClose")}
        onConfirm={() => {
          void deleteSelected();
        }}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
