"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  clientFormFromInitial,
  isClientFormDirty,
  type ClientEditFormErrors,
  type ClientEditFormState,
  type ClientEditInitialValues,
} from "@/components/admin/admin-client-edit-form.types";
import { validateClientEditForm } from "@/components/admin/admin-client-edit-form.validation";
import { ApiError, apiFetch } from "@/lib/api";

type UseClientEditFormArgs = {
  clientId: string;
  resetKey: string;
  initial: ClientEditInitialValues;
  labels: Parameters<typeof validateClientEditForm>[0]["labels"];
  onSaved?: () => void;
};

export function useClientEditForm({
  clientId,
  resetKey,
  initial,
  labels,
  onSaved,
}: UseClientEditFormArgs) {
  const router = useRouter();
  const submitLockRef = useRef(false);
  const [form, setForm] = useState<ClientEditFormState>(() => clientFormFromInitial(initial));
  const [snapshot, setSnapshot] = useState<ClientEditFormState>(() => clientFormFromInitial(initial));
  const [errors, setErrors] = useState<ClientEditFormErrors>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"ok" | "err">("ok");

  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    const nextForm = clientFormFromInitial(initial);
    setForm(nextForm);
    setSnapshot(nextForm);
    setErrors({});
    setMessage(null);
  }

  const dirty = useMemo(() => isClientFormDirty(form, snapshot), [form, snapshot]);

  function updateField<K extends keyof ClientEditFormState>(key: K, value: ClientEditFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "email" || key === "dateOfBirth") {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function cancelEdits(): void {
    const nextForm = clientFormFromInitial(initial);
    setForm(nextForm);
    setSnapshot(nextForm);
    setErrors({});
    setMessage(null);
  }

  async function save(okMessage: string, genericError: string): Promise<boolean> {
    if (busy || submitLockRef.current) {
      return false;
    }

    const { errors: nextErrors, payload } = validateClientEditForm({ form, labels });
    if (payload === null) {
      setErrors(nextErrors);
      return false;
    }

    submitLockRef.current = true;
    setBusy(true);
    setMessage(null);

    try {
      await apiFetch(`/clients/${clientId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      const nextForm = clientFormFromInitial({
        email: payload.email,
        name: payload.name,
        lastName: payload.lastName,
        phone: payload.phone,
        dateOfBirth: form.dateOfBirth.trim(),
      });
      setForm(nextForm);
      setSnapshot(nextForm);
      setMessageTone("ok");
      setMessage(okMessage);
      onSaved?.();
      router.refresh();
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
    updateField,
    cancelEdits,
    save,
    clearMessage: () => setMessage(null),
  };
}
