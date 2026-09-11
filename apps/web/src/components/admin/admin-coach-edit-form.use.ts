"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  createScheduleRow,
  calculateAgeFromBirthday,
  filterKnownAssignedClassTypeIds,
  MAX_PHOTO_BYTES,
  readFileAsBase64Payload,
  type CoachClassOption,
} from "@/components/admin/admin-coach-form-helpers";
import type { AdminCoachDirectoryRow } from "@/components/admin/admin-coaches-types";
import {
  coachFormFromInitial,
  isCoachFormDirty,
  type CoachEditFormErrors,
  type CoachEditFormState,
  type CoachEditInitialValues,
} from "@/components/admin/admin-coach-edit-form.types";
import { validateCoachEditForm } from "@/components/admin/admin-coach-edit-form.validation";
import { ApiError, apiFetch } from "@/lib/api";
import { revalidatePublicCoaches } from "@/lib/revalidate-public-coaches";

type CoachUpdateResponse = {
  assignedClassTypeIds: string[];
  updatedAt: string;
  bio: string | null;
  specialization: string | null;
  experienceYears: number | null;
  salaryPerClassAmd: number;
  cardImageUrl: string | null;
  classTypeRates: { classTypeId: string; amountAmd: number }[];
  availabilitySlots: {
    id: string;
    slotDate: string;
    slotTime: string;
    availableSpots: number;
  }[];
  user: {
    id: string;
    email: string;
    name: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    dateOfBirth: string | null;
  };
};

export type CoachSavedSnapshot = Pick<
  AdminCoachDirectoryRow,
  | "bio"
  | "specialization"
  | "experienceYears"
  | "salaryPerClassAmd"
  | "assignedClassTypeIds"
  | "classTypeRates"
  | "schedule"
  | "updatedAt"
  | "age"
  | "cardImageUrl"
  | "user"
>;

function ratesRecordFromApi(
  rates: readonly { classTypeId: string; amountAmd: number }[],
): Record<string, string> {
  const next: Record<string, string> = {};
  for (const rate of rates) {
    if (rate.amountAmd > 0) {
      next[rate.classTypeId] = String(rate.amountAmd);
    }
  }
  return next;
}

function coachSavedSnapshotFromUpdate(
  updated: CoachUpdateResponse,
  cardImageUrl: string | null,
): CoachSavedSnapshot {
  const dateOfBirth = updated.user.dateOfBirth;
  const birthdayIso = dateOfBirth === null ? null : dateOfBirth.slice(0, 10);

  return {
    bio: updated.bio,
    specialization: updated.specialization,
    experienceYears: updated.experienceYears,
    salaryPerClassAmd: updated.salaryPerClassAmd ?? 0,
    assignedClassTypeIds: updated.assignedClassTypeIds,
    classTypeRates: updated.classTypeRates ?? [],
    cardImageUrl,
    updatedAt: updated.updatedAt,
    schedule: updated.availabilitySlots.map((slot) => ({
      id: slot.id,
      date: slot.slotDate,
      time: slot.slotTime,
      spots: slot.availableSpots,
    })),
    age: birthdayIso === null ? null : calculateAgeFromBirthday(birthdayIso),
    user: {
      id: updated.user.id,
      name: updated.user.name,
      lastName: updated.user.lastName,
      email: updated.user.email,
      phone: updated.user.phone,
      dateOfBirth,
      avatarUrl: updated.user.avatarUrl,
    },
  };
}

type UseCoachEditFormArgs = {
  coachId: string;
  resetKey: string;
  initial: CoachEditInitialValues;
  classOptions: readonly CoachClassOption[];
  labels: Parameters<typeof validateCoachEditForm>[0]["labels"];
  onSaved?: (snapshot: CoachSavedSnapshot) => void;
};

export function useCoachEditForm({
  coachId,
  resetKey,
  initial,
  classOptions,
  labels,
  onSaved,
}: UseCoachEditFormArgs) {
  const router = useRouter();
  const submitLockRef = useRef(false);
  const [form, setForm] = useState<CoachEditFormState>(() => coachFormFromInitial(initial, classOptions));
  const [snapshot, setSnapshot] = useState<CoachEditFormState>(() => coachFormFromInitial(initial, classOptions));
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [cardImageFile, setCardImageFile] = useState<File | null>(null);
  const [cardImagePreviewUrl, setCardImagePreviewUrl] = useState<string | null>(null);
  const [cardImageRemoved, setCardImageRemoved] = useState(false);
  const [errors, setErrors] = useState<CoachEditFormErrors>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"ok" | "err">("ok");
  const [prevResetKey, setPrevResetKey] = useState(resetKey);

  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    const nextForm = coachFormFromInitial(initial, classOptions);
    setForm(nextForm);
    setSnapshot(nextForm);
    setPhotoPreviewUrl((prev) => {
      if (prev !== null) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setCardImagePreviewUrl((prev) => {
      if (prev !== null) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setPhotoFile(null);
    setPhotoRemoved(false);
    setCardImageFile(null);
    setCardImageRemoved(false);
    setErrors({});
    setMessage(null);
  }

  const dirty = useMemo(
    () =>
      isCoachFormDirty(form, snapshot) ||
      photoFile !== null ||
      photoRemoved ||
      cardImageFile !== null ||
      cardImageRemoved,
    [form, snapshot, photoFile, photoRemoved, cardImageFile, cardImageRemoved],
  );

  async function refreshCoachViews(): Promise<void> {
    await revalidatePublicCoaches();
    router.refresh();
  }

  function updateField<K extends keyof CoachEditFormState>(key: K, value: CoachEditFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function onPhotoSelected(file: File | null): void {
    if (file !== null && file.size > MAX_PHOTO_BYTES) {
      setErrors((prev) => ({ ...prev, photo: labels.photoTooLarge }));
      return;
    }
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

  function onCardImageSelected(file: File | null): void {
    if (file !== null && file.size > MAX_PHOTO_BYTES) {
      setErrors((prev) => ({ ...prev, cardImage: labels.photoTooLarge }));
      return;
    }
    if (cardImagePreviewUrl !== null) {
      URL.revokeObjectURL(cardImagePreviewUrl);
    }
    setCardImageFile(file);
    setCardImagePreviewUrl(file !== null ? URL.createObjectURL(file) : null);
    if (file !== null) {
      setCardImageRemoved(false);
    }
    setErrors((prev) => ({ ...prev, cardImage: undefined }));
  }

  function onCardImageDeleted(): void {
    if (cardImagePreviewUrl !== null) {
      URL.revokeObjectURL(cardImagePreviewUrl);
    }
    setCardImagePreviewUrl(null);
    setCardImageFile(null);
    setCardImageRemoved(true);
    updateField("cardImageUrl", "");
  }

  function toggleClassSelection(classTypeId: string): void {
    setForm((prev) => {
      const selected = prev.assignedClassTypeIds.includes(classTypeId);
      const assignedClassTypeIds = filterKnownAssignedClassTypeIds(
        selected
          ? prev.assignedClassTypeIds.filter((value) => value !== classTypeId)
          : [...prev.assignedClassTypeIds, classTypeId],
        classOptions,
      );
      const classTypeRates = { ...prev.classTypeRates };
      if (selected) {
        delete classTypeRates[classTypeId];
      }
      return { ...prev, assignedClassTypeIds, classTypeRates };
    });
    setErrors((prev) => ({
      ...prev,
      assignedClassTypeIds: undefined,
      classTypeRates: undefined,
    }));
  }

  function updateClassTypeRate(classTypeId: string, amountAmd: string): void {
    setForm((prev) => ({
      ...prev,
      classTypeRates: { ...prev.classTypeRates, [classTypeId]: amountAmd },
    }));
    setErrors((prev) => ({ ...prev, classTypeRates: undefined }));
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
    const nextForm = coachFormFromInitial(initial, classOptions);
    setForm(nextForm);
    setSnapshot(nextForm);
    setPhotoPreviewUrl((prev) => {
      if (prev !== null) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setCardImagePreviewUrl((prev) => {
      if (prev !== null) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setPhotoFile(null);
    setPhotoRemoved(false);
    setCardImageFile(null);
    setCardImageRemoved(false);
    setErrors({});
    setMessage(null);
  }

  async function save(
    okMessage: string,
    genericError: string,
    options?: { silentSuccess?: boolean },
  ): Promise<boolean> {
    if (busy || submitLockRef.current) {
      return false;
    }

    const { errors: nextErrors, payload } = validateCoachEditForm({
      form,
      photoFile,
      photoRemoved,
      cardImageFile,
      cardImageRemoved,
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
      const updated = await apiFetch<CoachUpdateResponse>(`/coaches/${coachId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      let nextAvatarUrl = updated.user.avatarUrl;
      if (photoFile !== null) {
        const filePayload = await readFileAsBase64Payload(photoFile);
        const uploaded = await apiFetch<{ avatarUrl: string }>(`/coaches/${coachId}/photo-json`, {
          method: "POST",
          body: JSON.stringify(filePayload),
        });
        nextAvatarUrl = uploaded.avatarUrl;
      }

      let nextCardImageUrl = updated.cardImageUrl ?? null;
      if (cardImageFile !== null) {
        const filePayload = await readFileAsBase64Payload(cardImageFile);
        const uploaded = await apiFetch<{ cardImageUrl: string }>(
          `/coaches/${coachId}/card-image-json`,
          {
            method: "POST",
            body: JSON.stringify(filePayload),
          },
        );
        nextCardImageUrl = uploaded.cardImageUrl;
      }

      const nextForm = {
        ...form,
        assignedClassTypeIds: [...updated.assignedClassTypeIds],
        classTypeRates: ratesRecordFromApi(updated.classTypeRates ?? []),
        photoUrl: nextAvatarUrl ?? "",
        cardImageUrl: nextCardImageUrl ?? "",
      };
      setForm(nextForm);
      setSnapshot(nextForm);
      setPhotoPreviewUrl((prev) => {
        if (prev !== null) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      setCardImagePreviewUrl((prev) => {
        if (prev !== null) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      setPhotoFile(null);
      setPhotoRemoved(false);
      setCardImageFile(null);
      setCardImageRemoved(false);

      if (!options?.silentSuccess) {
        setToneOk(okMessage);
      }
      onSaved?.(
        coachSavedSnapshotFromUpdate(
          {
            ...updated,
            user: { ...updated.user, avatarUrl: nextAvatarUrl },
            cardImageUrl: nextCardImageUrl,
          },
          nextCardImageUrl,
        ),
      );
      await refreshCoachViews();
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
    cardImageFile,
    cardImagePreviewUrl,
    cardImageRemoved,
    updateField,
    onPhotoSelected,
    onPhotoDeleted,
    onCardImageSelected,
    onCardImageDeleted,
    toggleClassSelection,
    updateClassTypeRate,
    updateSchedule,
    addScheduleRow,
    removeScheduleRow,
    cancelEdits,
    save,
    clearMessage: () => setMessage(null),
  };
}
