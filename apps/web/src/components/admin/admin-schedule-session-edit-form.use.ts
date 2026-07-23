"use client";

import { useMemo, useRef, useState } from "react";
import type { AdminScheduleCoach, AdminScheduleSession } from "@/components/admin/admin-schedule-management";
import { filterCoachesByClassType } from "@/components/admin/admin-schedule-coach-filter";
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
  coaches: readonly AdminScheduleCoach[];
  onSaved: (saved: AdminScheduleSession) => void;
};

export function useSessionEditForm({
  sessionId,
  resetKey,
  initial,
  classTypeOptions,
  coaches,
  onSaved,
}: UseSessionEditFormArgs) {
  const submitLockRef = useRef(false);

  const [form, setForm] = useState<SessionEditFormState>(initial);
  const [snapshot, setSnapshot] = useState<SessionEditFormState>(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"ok" | "err">("ok");

  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    const next = { ...initial };
    setForm(next);
    setSnapshot(next);
    setMessage(null);
  }

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

  async function save(
    successMessage: string,
    genericError: string,
    coachNotAssigned: string,
  ): Promise<void> {
    if (submitLockRef.current || busy || !dirty) {
      return;
    }
    submitLockRef.current = true;
    setBusy(true);
    setMessage(null);
    try {
      const resolved = resolveSessionClassTypeId(form.classTypeId, classTypeOptions);
      const eligibleCoaches = filterCoachesByClassType(coaches, resolved.classTypeId);
      if (
        eligibleCoaches.length === 0 ||
        !eligibleCoaches.some((coach) => coach.id === form.coachId)
      ) {
        setMessage(coachNotAssigned);
        setMessageTone("err");
        return;
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
      setMessage(requestError instanceof ApiError ? requestError.message : genericError);
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
