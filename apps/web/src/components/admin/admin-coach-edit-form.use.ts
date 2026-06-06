"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  createScheduleRow,
  MAX_PHOTO_BYTES,
  readFileAsBase64Payload,
  type CoachClassOption,
} from "@/components/admin/admin-coach-form-helpers";
import {
  coachFormFromInitial,
  isCoachFormDirty,
  type CoachEditFormErrors,
  type CoachEditFormState,
  type CoachEditInitialValues,
} from "@/components/admin/admin-coach-edit-form.types";
import { validateCoachEditForm } from "@/components/admin/admin-coach-edit-form.validation";
import { ApiError, apiFetch } from "@/lib/api";

type UseCoachEditFormArgs = {
  coachId: string;
  resetKey: string;
  initial: CoachEditInitialValues;
  classTypeOptions: readonly string[];
  classOptions: readonly CoachClassOption[];
  labels: Parameters<typeof validateCoachEditForm>[0]["labels"];
  onSaved?: () => void;
};

export function useCoachEditForm({
  coachId,
  resetKey,
  initial,
  classTypeOptions,
  classOptions,
  labels,
  onSaved,
}: UseCoachEditFormArgs) {
  const router = useRouter();
  const submitLockRef = useRef(false);
  const initialRef = useRef(initial);
  initialRef.current = initial;
  const [form, setForm] = useState<CoachEditFormState>(() => coachFormFromInitial(initial));
  const [snapshot, setSnapshot] = useState<CoachEditFormState>(() => coachFormFromInitial(initial));
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [errors, setErrors] = useState<CoachEditFormErrors>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"ok" | "err">("ok");

  useEffect(() => {
    const nextForm = coachFormFromInitial(initialRef.current);
    setForm(nextForm);
    setSnapshot(nextForm);
    setPhotoPreviewUrl((prev) => {
      if (prev !== null) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setPhotoFile(null);
    setPhotoRemoved(false);
    setErrors({});
    setMessage(null);
  }, [resetKey]);

  const dirty = useMemo(() => isCoachFormDirty(form, snapshot) || photoFile !== null || photoRemoved, [
    form,
    snapshot,
    photoFile,
    photoRemoved,
  ]);

  function updateField<K extends keyof CoachEditFormState>(key: K, value: CoachEditFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function onPhotoSelected(file: File | null): void {
    if (photoPreviewUrl !== null) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoFile(file);
    setPhotoPreviewUrl(file !== null ? URL.createObjectURL(file) : null);
    if (file !== null) {
      setPhotoRemoved(false);
    }
    setErrors((prev) => ({ ...prev, photo: undefined }));
  }

  function onPhotoDeleted(): void {
    if (photoPreviewUrl !== null) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoPreviewUrl(null);
    setPhotoFile(null);
    setPhotoRemoved(true);
    updateField("photoUrl", "");
  }

  async function uploadPhoto(
    file: File,
    successMessage: string,
    genericError: string,
  ): Promise<void> {
    if (busy || submitLockRef.current) {
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setErrors((prev) => ({ ...prev, photo: labels.photoTooLarge }));
      return;
    }

    submitLockRef.current = true;
    setBusy(true);
    setMessage(null);
    setErrors((prev) => ({ ...prev, photo: undefined }));

    try {
      const filePayload = await readFileAsBase64Payload(file);
      const uploaded = await apiFetch<{ avatarUrl: string }>(`/coaches/${coachId}/photo-json`, {
        method: "POST",
        body: JSON.stringify(filePayload),
      });
      const nextForm = { ...form, photoUrl: uploaded.avatarUrl };
      setForm(nextForm);
      setSnapshot(nextForm);
      setPhotoPreviewUrl((prev) => {
        if (prev !== null) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      setPhotoFile(null);
      setPhotoRemoved(false);
      setToneOk(successMessage);
      router.refresh();
    } catch (error) {
      setToneErr(error instanceof ApiError ? error.message : genericError);
    } finally {
      submitLockRef.current = false;
      setBusy(false);
    }
  }

  async function removePhoto(successMessage: string, genericError: string): Promise<void> {
    if (busy || submitLockRef.current) {
      return;
    }

    submitLockRef.current = true;
    setBusy(true);
    setMessage(null);

    try {
      await apiFetch(`/coaches/${coachId}`, {
        method: "PATCH",
        body: JSON.stringify({ photoUrl: "" }),
      });
      const nextForm = { ...form, photoUrl: "" };
      setForm(nextForm);
      setSnapshot(nextForm);
      setPhotoPreviewUrl((prev) => {
        if (prev !== null) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      setPhotoFile(null);
      setPhotoRemoved(false);
      setToneOk(successMessage);
      router.refresh();
    } catch (error) {
      setToneErr(error instanceof ApiError ? error.message : genericError);
    } finally {
      submitLockRef.current = false;
      setBusy(false);
    }
  }

  function toggleClassSelection(classTypeId: string): void {
    setForm((prev) => ({
      ...prev,
      assignedClassTypeIds: prev.assignedClassTypeIds.includes(classTypeId)
        ? prev.assignedClassTypeIds.filter((value) => value !== classTypeId)
        : [...prev.assignedClassTypeIds, classTypeId],
    }));
    setErrors((prev) => ({ ...prev, assignedClassTypeIds: undefined }));
  }

  function updateSchedule(
    rowId: string,
    key: "date" | "time" | "spots",
    value: string,
  ): void {
    setForm((prev) => ({
      ...prev,
      schedule: prev.schedule.map((row) => (row.id === rowId ? { ...row, [key]: value } : row)),
    }));
    setErrors((prev) => ({ ...prev, schedule: undefined }));
  }

  function addScheduleRow(): void {
    setForm((prev) => ({ ...prev, schedule: [...prev.schedule, createScheduleRow()] }));
  }

  function removeScheduleRow(rowId: string): void {
    setForm((prev) => ({
      ...prev,
      schedule:
        prev.schedule.length <= 1 ? prev.schedule : prev.schedule.filter((row) => row.id !== rowId),
    }));
  }

  function cancelEdits(): void {
    const nextForm = coachFormFromInitial(initialRef.current);
    setForm(nextForm);
    setSnapshot(nextForm);
    setPhotoPreviewUrl((prev) => {
      if (prev !== null) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setPhotoFile(null);
    setPhotoRemoved(false);
    setErrors({});
    setMessage(null);
  }

  async function save(okMessage: string, genericError: string): Promise<boolean> {
    if (busy || submitLockRef.current) {
      return false;
    }

    const { errors: nextErrors, payload } = validateCoachEditForm({
      form,
      photoFile,
      photoRemoved,
      classTypeOptions,
      classOptions,
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
      await apiFetch(`/coaches/${coachId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (photoFile !== null) {
        const filePayload = await readFileAsBase64Payload(photoFile);
        const uploaded = await apiFetch<{ avatarUrl: string }>(`/coaches/${coachId}/photo-json`, {
          method: "POST",
          body: JSON.stringify(filePayload),
        });
        const nextForm = { ...form, photoUrl: uploaded.avatarUrl };
        setForm(nextForm);
        setSnapshot(nextForm);
        setPhotoPreviewUrl((prev) => {
          if (prev !== null) {
            URL.revokeObjectURL(prev);
          }
          return null;
        });
        setPhotoFile(null);
        setPhotoRemoved(false);
      } else {
        setSnapshot(form);
      }
      setToneOk(okMessage);
      onSaved?.();
      router.refresh();
      return true;
    } catch (error) {
      setToneErr(error instanceof ApiError ? error.message : genericError);
      return false;
    } finally {
      submitLockRef.current = false;
      setBusy(false);
    }
  }

  function setToneOk(text: string) {
    setMessageTone("ok");
    setMessage(text);
  }

  function setToneErr(text: string) {
    setMessageTone("err");
    setMessage(text);
  }

  return {
    form,
    errors,
    busy,
    dirty,
    message,
    messageTone,
    photoFile,
    photoPreviewUrl,
    photoRemoved,
    updateField,
    onPhotoSelected,
    onPhotoDeleted,
    uploadPhoto,
    removePhoto,
    toggleClassSelection,
    updateSchedule,
    addScheduleRow,
    removeScheduleRow,
    cancelEdits,
    save,
    clearMessage: () => setMessage(null),
  };
}
