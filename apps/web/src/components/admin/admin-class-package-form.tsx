"use client";

import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { buildClassTypeSlugFromName } from "@/lib/class-type-slug";
import { OmmButton } from "@/components/ui/omm-button";

const MAX_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 4000;

type ClassTypeCreateResponse = {
  id: string;
  name: string;
  slug: string;
};

type AdminClassPackageFormProps = {
  existingNames: readonly string[];
  onSaved: () => void;
  onCancel: () => void;
};

export function AdminClassPackageForm({
  existingNames,
  onSaved,
  onCancel,
}: AdminClassPackageFormProps) {
  const t = useTranslations("adminPages.packages");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitLockRef = useRef(false);

  const slugPreview = useMemo(() => buildClassTypeSlugFromName(name), [name]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitLockRef.current) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    setError(null);

    if (trimmedName.length === 0) {
      setError(t("nameRequired"));
      return;
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      setError(t("nameTooLong"));
      return;
    }
    if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
      setError(t("descriptionTooLong"));
      return;
    }
    const slug = buildClassTypeSlugFromName(trimmedName);
    if (slug.length === 0) {
      setError(t("slugInvalid"));
      return;
    }
    const duplicate = existingNames.some(
      (value) => value.toLowerCase() === trimmedName.toLowerCase(),
    );
    if (duplicate) {
      setError(t("nameDuplicate"));
      return;
    }

    submitLockRef.current = true;
    setPending(true);
    try {
      await apiFetch<ClassTypeCreateResponse>("/classes/types", {
        method: "POST",
        body: JSON.stringify({
          name: trimmedName,
          slug,
          description: trimmedDescription.length > 0 ? trimmedDescription : undefined,
        }),
      });
      onSaved();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error && err.message.trim().length > 0) {
        setError(err.message);
      } else {
        setError(t("genericError"));
      }
    } finally {
      setPending(false);
      submitLockRef.current = false;
    }
  }

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="flex flex-col gap-4"
    >
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldClassName")}</span>
        <input
          name="name"
          className="ommm-input"
          maxLength={MAX_NAME_LENGTH}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          disabled={pending}
        />
      </label>

      <div className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldSlug")}</span>
        <p className="ommm-input bg-white/40 text-sage-600">{slugPreview || "—"}</p>
      </div>

      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldDescription")}</span>
        <textarea
          name="description"
          className="ommm-input min-h-20"
          maxLength={MAX_DESCRIPTION_LENGTH}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={pending}
        />
      </label>

      <p className="text-xs text-sage-500">{t("createUnsupportedHint")}</p>

      {error !== null ? (
        <p className="app-alert-warn text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <OmmButton type="button" variant="secondary" size="sm" onClick={onCancel} disabled={pending}>
          {t("cancelButton")}
        </OmmButton>
        <OmmButton type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? t("savingButton") : t("saveButton")}
        </OmmButton>
      </div>
    </form>
  );
}
