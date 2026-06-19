"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { OmmButton } from "@/components/ui/omm-button";
import { buildClassTypeSlugFromName } from "@/lib/class-type-slug";

type AdminClassTypeRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type AdminTypesManagementProps = {
  initialTypes: readonly AdminClassTypeRow[];
};

type FormState = {
  name: string;
  description: string;
};

function emptyFormState(): FormState {
  return { name: "", description: "" };
}

function normalizeFormPayload(form: FormState): {
  name: string;
  slug: string;
  description?: string;
} {
  const name = form.name.trim();
  const slug = buildClassTypeSlugFromName(name);
  const description = form.description.trim();
  return {
    name,
    slug,
    ...(description.length > 0 ? { description } : {}),
  };
}

export function AdminTypesManagement({ initialTypes }: AdminTypesManagementProps) {
  const t = useTranslations("adminPages.classes.classTypes");
  const [rows, setRows] = useState<readonly AdminClassTypeRow[]>(initialTypes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyFormState);

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
    setForm({
      name: row.name,
      description: row.description ?? "",
    });
    setError(null);
    setSuccess(null);
  }

  function startCreate(): void {
    setSelectedId(null);
    setForm(emptyFormState());
    setError(null);
    setSuccess(null);
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
        setRows((current) =>
          [...current, created].sort((left, right) => left.name.localeCompare(right.name)),
        );
        setSelectedId(created.id);
        setForm({
          name: created.name,
          description: created.description ?? "",
        });
        setSuccess(t("messages.createSuccess"));
      } else {
        const updated = await apiFetch<AdminClassTypeRow>(`/classes/types/${selectedId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setRows((current) =>
          current
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
      setRows((current) => current.filter((row) => row.id !== selectedId));
      setSelectedId(null);
      setForm(emptyFormState());
      setSuccess(t("messages.deleteSuccess"));
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : t("messages.genericError"),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHero
        title={t("modalTitle")}
        search={
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("listSearchPlaceholder")}
            className="ommm-input w-full"
          />
        }
        trailing={
          <OmmButton type="button" variant="secondary" onClick={startCreate}>
            {t("addButton")}
          </OmmButton>
        }
      />

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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-white/60 bg-white/80 p-3 sm:p-4">
          {filteredRows.length === 0 ? (
            <p className="text-sm text-sage-600">{t("listNoMatches")}</p>
          ) : (
            <ul className="space-y-2">
              {filteredRows.map((row) => {
                const active = row.id === selectedId;
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => selectForEdit(row)}
                      className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                        active
                          ? "border-sand-300 bg-sand-50 text-sage-900"
                          : "border-white/70 bg-white/70 text-sage-700 hover:bg-white"
                      }`}
                    >
                      <p className="text-sm font-semibold">{row.name}</p>
                      <p className="mt-1 text-xs text-sage-500">{row.slug}</p>
                      {row.description ? (
                        <p className="mt-2 line-clamp-2 text-xs text-sage-600">{row.description}</p>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <form
          className="rounded-2xl border border-white/60 bg-white/80 p-4 sm:p-5"
          onSubmit={(event) => {
            event.preventDefault();
            void submitForm();
          }}
        >
          <h2 className="text-base font-semibold text-sage-900">
            {selected ? t("formEditTitle") : t("formCreateTitle")}
          </h2>
          <div className="mt-4 space-y-3">
            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-sage-600">
                {t("fieldName")}
              </span>
              <input
                className="ommm-input w-full"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                disabled={pending}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-sage-600">
                {t("fieldDescription")}
              </span>
              <textarea
                className="ommm-input min-h-24 w-full resize-y"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                disabled={pending}
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <OmmButton type="submit" variant="primary" disabled={pending}>
              {pending ? t("savingButton") : selected ? t("saveButton") : t("createButton")}
            </OmmButton>
            {selected ? (
              <OmmButton type="button" variant="ghost" disabled={pending} onClick={startCreate}>
                {t("cancelButton")}
              </OmmButton>
            ) : null}
            {selected ? (
              <OmmButton type="button" variant="danger" disabled={pending} onClick={() => void deleteSelected()}>
                {t("deleteButton")}
              </OmmButton>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
