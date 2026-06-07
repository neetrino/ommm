"use client";

import { useMemo, useRef, useState } from "react";
import type { AdminClassTypeRow } from "@/components/admin/admin-class-types-types";
import {
  classTypeFormFromRow,
  isClassTypeFormDirty,
  type ClassTypeEditFormErrors,
  type ClassTypeEditFormState,
} from "@/components/admin/admin-class-type-edit-form.types";
import { validateClassTypeForm } from "@/components/admin/admin-class-type-edit-form.validation";
import { ApiError, apiFetch } from "@/lib/api";

type UseClassTypeEditFormArgs = {
  mode: "create" | "edit";
  typeId: string | null;
  resetKey: string;
  initial: ClassTypeEditFormState;
  existingTypes: readonly AdminClassTypeRow[];
  labels: Parameters<typeof validateClassTypeForm>[0]["labels"];
  onSaved: (saved: AdminClassTypeRow, mode: "create" | "edit") => void;
};

export function useClassTypeEditForm({
  mode,
  typeId,
  resetKey,
  initial,
  existingTypes,
  labels,
  onSaved,
}: UseClassTypeEditFormArgs) {
  const submitLockRef = useRef(false);

  const [form, setForm] = useState<ClassTypeEditFormState>(initial);
  const [snapshot, setSnapshot] = useState<ClassTypeEditFormState>(initial);
  const [errors, setErrors] = useState<ClassTypeEditFormErrors>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"ok" | "err">("ok");

  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    const nextForm = classTypeFormFromRow({
      name: initial.name,
      description: initial.description,
    });
    setForm(nextForm);
    setSnapshot(nextForm);
    setErrors({});
    setMessage(null);
  }

  const dirty = useMemo(() => isClassTypeFormDirty(form, snapshot), [form, snapshot]);

  function updateForm(next: ClassTypeEditFormState): void {
    setForm(next);
  }

  function validateField(field: keyof ClassTypeEditFormErrors): void {
    const { errors: nextErrors } = validateClassTypeForm({
      form,
      typeId,
      existingTypes,
      labels,
    });
    setErrors((current) => ({ ...current, [field]: nextErrors[field] }));
  }

  function cancelEdits(): void {
    setForm(snapshot);
    setErrors({});
    setMessage(null);
  }

  function clearMessage(): void {
    setMessage(null);
  }

  async function save(okMessage: string, genericError: string): Promise<boolean> {
    if (busy || submitLockRef.current) {
      return false;
    }

    const { errors: nextErrors, payload } = validateClassTypeForm({
      form,
      typeId,
      existingTypes,
      labels,
    });
    if (payload === null) {
      setErrors(nextErrors);
      return false;
    }

    submitLockRef.current = true;
    setBusy(true);
    setMessage(null);

    try {
      const saved =
        mode === "edit" && typeId !== null
          ? await apiFetch<AdminClassTypeRow>(`/classes/types/${typeId}`, {
              method: "PATCH",
              body: JSON.stringify({
                name: payload.name,
                slug: payload.slug,
                description: payload.description,
              }),
            })
          : await apiFetch<AdminClassTypeRow>("/classes/types", {
              method: "POST",
              body: JSON.stringify({
                name: payload.name,
                slug: payload.slug,
                description: payload.description ?? undefined,
              }),
            });

      const nextForm = classTypeFormFromRow(saved);
      setForm(nextForm);
      setSnapshot(nextForm);
      setErrors({});
      setMessageTone("ok");
      setMessage(okMessage);
      onSaved(saved, mode);
      return true;
    } catch (error) {
      setMessageTone("err");
      setMessage(error instanceof ApiError ? error.message : genericError);
      return false;
    } finally {
      submitLockRef.current = false;
      setBusy(false);
    }
  }

  return {
    form,
    errors,
    busy,
    dirty,
    message,
    messageTone,
    updateForm,
    validateField,
    cancelEdits,
    save,
    clearMessage,
  };
}
