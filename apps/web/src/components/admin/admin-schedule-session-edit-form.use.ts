"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-management";
import {
  resolveSessionClassTypeId,
  type SessionClassTypeOption,
} from "@/components/admin/admin-schedule-session-class-type-resolve";
import {
  isSessionEditFormDirty,
  sessionEditFormFromRow,
  sessionEditFormPayload,
  type SessionEditFormState,
} from "@/components/admin/admin-schedule-session-edit-form.types";
import { ApiError, apiFetch } from "@/lib/api";

type UseSessionEditFormArgs = {
  sessionId: string;
  resetKey: string;
  initial: SessionEditFormState;
  classTypeOptions: readonly SessionClassTypeOption[];
  onSaved: (saved: AdminScheduleSession) => void;
  onClassTypeCreated?: (type: { id: string; name: string; slug: string }) => void;
};

export function useSessionEditForm({
  sessionId,
  resetKey,
  initial,
  classTypeOptions,
  onSaved,
  onClassTypeCreated,
}: UseSessionEditFormArgs) {
  const submitLockRef = useRef(false);
  const initialRef = useRef(initial);
  initialRef.current = initial;

  const [form, setForm] = useState<SessionEditFormState>(initial);
  const [snapshot, setSnapshot] = useState<SessionEditFormState>(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"ok" | "err">("ok");

  useEffect(() => {
    const next = { ...initialRef.current };
    setForm(next);
    setSnapshot(next);
    setMessage(null);
  }, [resetKey]);

  const dirty = useMemo(() => isSessionEditFormDirty(form, snapshot), [form, snapshot]);

  function updateForm(next: SessionEditFormState): void {
    setForm(next);
  }

  function cancelEdits(): void {
    setForm(snapshot);
    setMessage(null);
  }

  function clearMessage(): void {
    setMessage(null);
  }

  async function save(successMessage: string, errorMessage: string): Promise<void> {
    if (submitLockRef.current || busy || !dirty) {
      return;
    }
    submitLockRef.current = true;
    setBusy(true);
    setMessage(null);
    try {
      const resolved = await resolveSessionClassTypeId(form.classTypeId, classTypeOptions);
      if (resolved.created) {
        onClassTypeCreated?.(resolved.created);
      }
      const saved = await apiFetch<AdminScheduleSession>(`/classes/sessions/${sessionId}`, {
        method: "PATCH",
        body: JSON.stringify(sessionEditFormPayload(form, resolved.classTypeId)),
      });
      const nextForm = sessionEditFormFromRow(
        saved,
        form.classTypeId,
        form.coachId,
      );
      setForm(nextForm);
      setSnapshot(nextForm);
      setMessage(successMessage);
      setMessageTone("ok");
      onSaved(saved);
    } catch (requestError) {
      setMessage(requestError instanceof ApiError ? requestError.message : errorMessage);
      setMessageTone("err");
    } finally {
      setBusy(false);
      submitLockRef.current = false;
    }
  }

  return {
    form,
    updateForm,
    dirty,
    busy,
    message,
    messageTone,
    cancelEdits,
    clearMessage,
    save,
  };
}

export type SessionEditFormController = ReturnType<typeof useSessionEditForm>;
