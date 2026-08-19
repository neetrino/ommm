"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { sanitizeImageSrcUrl } from "@/lib/sanitize-image-src-url";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

function readFileAsHomeImageJsonPayload(
  file: File,
  readFailed: string,
): Promise<{ imageBase64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = reader.result;
      if (typeof s !== "string") {
        reject(new Error(readFailed));
        return;
      }
      const i = s.indexOf("base64,");
      if (i === -1) {
        reject(new Error(readFailed));
        return;
      }
      resolve({
        imageBase64: s.slice(i + "base64,".length),
        mimeType: file.type || "image/jpeg",
      });
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error(readFailed));
    };
    reader.readAsDataURL(file);
  });
}

type AccountHomeImageFormProps = {
  initialPreviewUrl?: string | null;
  profileInitials: string;
};

/** Profile avatar — choose, preview, confirm, or delete. */
export function AccountHomeImageForm({
  initialPreviewUrl,
  profileInitials,
}: AccountHomeImageFormProps) {
  const router = useRouter();
  const t = useTranslations("forms.homeImage");
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");

  const savedUrl = initialPreviewUrl ?? null;
  const hasPending = pendingFile !== null;
  const hasSaved = !hasPending && savedUrl !== null;

  const rawPreview = hasPending ? pendingPreviewUrl : savedUrl;
  const previewSrc = useMemo(
    () =>
      rawPreview !== null
        ? sanitizeImageSrcUrl(rawPreview, { allowBlob: true })
        : null,
    [rawPreview],
  );
  const previewImgSrc = useMemo(
    () => (previewSrc !== null ? encodeURI(previewSrc) : null),
    [previewSrc],
  );

  useEffect(() => {
    return () => {
      if (pendingPreviewUrl !== null) {
        URL.revokeObjectURL(pendingPreviewUrl);
      }
    };
  }, [pendingPreviewUrl]);

  const clearPending = useCallback(() => {
    if (pendingPreviewUrl !== null) {
      URL.revokeObjectURL(pendingPreviewUrl);
    }
    setPendingFile(null);
    setPendingPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [pendingPreviewUrl]);

  const onFileSelected = useCallback(
    (file: File) => {
      if (busy || hasPending) {
        return;
      }
      setMsg(null);
      if (file.size > MAX_BYTES) {
        setTone("err");
        setMsg(t("tooLarge"));
        return;
      }
      const url = URL.createObjectURL(file);
      setPendingFile(file);
      setPendingPreviewUrl(url);
    },
    [busy, hasPending, t],
  );

  const confirmUpload = useCallback(async () => {
    if (busy || pendingFile === null) {
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const payload = await readFileAsHomeImageJsonPayload(pendingFile, t("readFailed"));
      await apiFetch<{ message: string }>("/users/me/home-image-json", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      clearPending();
      setTone("ok");
      setMsg(t("uploadSuccess"));
      router.refresh();
    } catch (e) {
      setTone("err");
      setMsg(e instanceof ApiError ? e.message : t("uploadFailed"));
    } finally {
      setBusy(false);
    }
  }, [busy, clearPending, pendingFile, router, t]);

  const deleteSavedPhoto = useCallback(async () => {
    if (busy || !hasSaved) {
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch<{ message: string }>("/users/me/home-image", {
        method: "DELETE",
      });
      setTone("ok");
      setMsg(t("deletePhotoSuccess"));
      router.refresh();
    } catch (e) {
      setTone("err");
      setMsg(e instanceof ApiError ? e.message : t("deletePhotoFailed"));
    } finally {
      setBusy(false);
      setPendingDelete(false);
    }
  }, [busy, hasSaved, router, t]);

  const avatarButtonClass = [
    "group relative aspect-square w-full overflow-hidden rounded-full border border-white/70 ommm-user-avatar-placeholder-surface shadow-[0_16px_40px_-24px_rgba(45,40,35,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-wait disabled:opacity-70",
    hasPending ? "ring-2 ring-sage-500/35" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex w-full flex-col items-center gap-2 lg:items-start">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        disabled={busy || hasPending}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onFileSelected(file);
          }
          event.target.value = "";
        }}
      />
      <div className="flex w-full max-w-[240px] flex-col items-center gap-2 sm:max-w-[260px] lg:max-w-[280px]">
        <button
          type="button"
          className={avatarButtonClass}
          aria-label={t("chooseImage")}
          disabled={busy || hasPending}
          onClick={() => inputRef.current?.click()}
        >
          {previewImgSrc ? (
            previewImgSrc.startsWith("blob:") ? (
              // eslint-disable-next-line @next/next/no-img-element -- local preview before confirm
              <img src={previewImgSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <Image
                src={previewImgSrc}
                alt=""
                fill
                sizes="(min-width: 1024px) 320px, 280px"
                className="object-cover"
              />
            )
          ) : (
            <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-sage-800 sm:text-4xl">
              {profileInitials}
            </span>
          )}
          {!hasPending ? (
            <span className="absolute inset-0 flex items-center justify-center bg-sage-900/0 px-4 text-center text-sm font-medium text-white opacity-0 transition group-hover:bg-sage-900/45 group-hover:opacity-100 group-focus-visible:bg-sage-900/45 group-focus-visible:opacity-100">
              {busy ? t("uploading") : t("chooseImage")}
            </span>
          ) : null}
        </button>

        {hasPending ? (
          <>
            <p className="text-center text-sm italic text-sage-500 lg:text-left">
              {t("pendingHint")}
            </p>
            <div className="mt-1 flex w-full flex-wrap items-center justify-center gap-2 lg:justify-start">
              <OmmButton
                type="button"
                variant="danger"
                size="sm"
                disabled={busy}
                onClick={clearPending}
              >
                {t("removePending")}
              </OmmButton>
              <OmmButton
                type="button"
                variant="primary"
                size="sm"
                disabled={busy}
                onClick={() => void confirmUpload()}
              >
                {busy ? t("uploading") : t("confirm")}
              </OmmButton>
            </div>
          </>
        ) : hasSaved ? (
          <OmmButton
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            className="mt-1 text-sage-600 hover:text-sage-900"
            onClick={() => setPendingDelete(true)}
          >
            {busy ? t("removingPhoto") : t("deletePhoto")}
          </OmmButton>
        ) : null}
      </div>
      <OmmConfirmDialog
        isOpen={pendingDelete}
        title={t("deletePhotoConfirmTitle")}
        description={t("deletePhotoConfirmDescription")}
        confirmLabel={busy ? t("removingPhoto") : t("deletePhotoConfirm")}
        cancelLabel={t("deletePhotoCancel")}
        backdropAriaLabel={t("deletePhotoBackdrop")}
        tone="danger"
        confirmClassName="ommm-btn-lifecycle-action--danger"
        pending={busy}
        onConfirm={() => {
          void deleteSavedPhoto();
        }}
        onCancel={() => {
          if (!busy) {
            setPendingDelete(false);
          }
        }}
      />
      {msg ? (
        <p
          className={`max-w-[240px] text-center text-sm sm:max-w-[260px] lg:max-w-[280px] lg:text-left ${tone === "ok" ? "text-sage-600" : "text-red-800"}`}
        >
          {msg}
        </p>
      ) : null}
    </div>
  );
}
