"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { GiftCardThumbnail } from "@/components/gift-cards/gift-card-thumbnail";
import {
  ADMIN_ACTION_ICON_CLASS,
  TrashGlyph,
} from "@/components/ui/admin-action-glyphs";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetchFormData } from "@/lib/api";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const COMPACT_COVER_BUTTON_CLASS =
  "h-full min-h-32 w-full overflow-hidden rounded-xl border border-white/70 bg-white/50 shadow-sm transition-colors hover:border-sand-300/80 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-0";

type ContentPostCoverImageFieldProps = {
  coverImageUrl: string;
  disabled?: boolean;
  layout?: "default" | "compact";
  onChange: (coverImageUrl: string) => void;
};

function isAcceptedImageType(type: string): type is (typeof ACCEPTED_IMAGE_TYPES)[number] {
  return ACCEPTED_IMAGE_TYPES.some((acceptedType) => acceptedType === type);
}

export function ContentPostCoverImageField({
  coverImageUrl,
  disabled = false,
  layout = "default",
  onChange,
}: ContentPostCoverImageFieldProps) {
  const t = useTranslations("contentAdminPages.content.coverImage");
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewUrl =
    localPreviewUrl ?? (coverImageUrl.trim().length > 0 ? coverImageUrl : null);

  async function handleFileSelected(file: File | null): Promise<void> {
    if (file === null || disabled || uploading) {
      return;
    }
    setError(null);
    if (!isAcceptedImageType(file.type)) {
      setError(t("invalidType"));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t("tooLarge"));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await apiFetchFormData<{ coverImageUrl: string }>(
        "/content/admin/cover-image",
        formData,
      );
      onChange(response.coverImageUrl);
      setLocalPreviewUrl(null);
    } catch (uploadError) {
      setLocalPreviewUrl(null);
      setError(uploadError instanceof ApiError ? uploadError.message : t("uploadFailed"));
    } finally {
      URL.revokeObjectURL(objectUrl);
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleRemove(event: React.MouseEvent): void {
    event.stopPropagation();
    if (disabled || uploading) {
      return;
    }
    setLocalPreviewUrl(null);
    setError(null);
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function openFilePicker(): void {
    if (disabled || uploading) {
      return;
    }
    inputRef.current?.click();
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
      className="sr-only"
      disabled={disabled || uploading}
      onChange={(event) => {
        const file = event.target.files?.[0] ?? null;
        void handleFileSelected(file);
      }}
    />
  );

  if (layout === "compact") {
    return (
      <div className="flex h-full min-w-0 w-full flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
          {t("label")}
        </span>
        {fileInput}
        <div className="relative min-h-32 w-full sm:min-h-0 sm:flex-1">
          <button
            type="button"
            className={COMPACT_COVER_BUTTON_CLASS}
            disabled={disabled || uploading}
            aria-label={uploading ? t("uploading") : t("choose")}
            title={uploading ? t("uploading") : t("choose")}
            onClick={openFilePicker}
          >
            {previewUrl !== null ? (
              <GiftCardThumbnail
                imageUrl={previewUrl}
                alt={t("previewAlt")}
                fallbackLabel={t("fallback")}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-sage-500">
                {uploading ? t("uploading") : t("choose")}
              </span>
            )}
          </button>
          {previewUrl !== null ? (
            <AdminRowIconButton
              ariaLabel={t("remove")}
              title={t("remove")}
              variant="danger"
              className="absolute -right-1 -top-1"
              disabled={disabled || uploading}
              onClick={handleRemove}
            >
              <TrashGlyph className={ADMIN_ACTION_ICON_CLASS} />
            </AdminRowIconButton>
          ) : null}
        </div>
        {error ? (
          <p className="text-[10px] leading-snug text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
        {t("label")}
      </span>
      <div className="rounded-2xl border border-white/60 bg-white/50 p-3">
        {fileInput}
        <div className="flex flex-wrap items-center gap-3">
          <OmmButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled || uploading}
            onClick={openFilePicker}
          >
            {uploading ? t("uploading") : t("choose")}
          </OmmButton>
          {previewUrl !== null ? (
            <OmmButton
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || uploading}
              onClick={handleRemove}
            >
              {t("remove")}
            </OmmButton>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-sage-500">{t("hint")}</p>
        {error ? (
          <p className="mt-2 text-xs text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {previewUrl !== null ? (
          <div className="mt-3 h-40 overflow-hidden rounded-xl border border-white/70 bg-sage-50">
            <GiftCardThumbnail
              imageUrl={previewUrl}
              alt={t("previewAlt")}
              fallbackLabel={t("fallback")}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
