"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useMemo, useRef, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { sanitizeImageSrcUrl } from "@/lib/sanitize-image-src-url";
import { OmmButton } from "@/components/ui/omm-button";
import { MarketingHeaderUserIcon } from "@/components/marketing/marketing-header-icons";

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
};

/** Profile avatar — hover to choose photo, uploads immediately on select. */
export function AccountHomeImageForm({
  initialPreviewUrl,
}: AccountHomeImageFormProps) {
  const router = useRouter();
  const t = useTranslations("forms.homeImage");
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [previewOverride, setPreviewOverride] = useState<string | null | undefined>(
    undefined,
  );

  const rawPreview =
    previewOverride !== undefined
      ? previewOverride
      : (objectUrl ?? initialPreviewUrl ?? null);
  const hasPhoto = rawPreview !== null;
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

  async function uploadFile(file: File) {
    setBusy(true);
    setMsg(null);
    try {
      if (file.size > MAX_BYTES) {
        setTone("err");
        setMsg(t("tooLarge"));
        return;
      }
      const payload = await readFileAsHomeImageJsonPayload(file, t("readFailed"));
      await apiFetch<{ message: string }>("/users/me/home-image-json", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (objectUrl !== null) {
        URL.revokeObjectURL(objectUrl);
      }
      setObjectUrl(URL.createObjectURL(file));
      setPreviewOverride(undefined);
      setTone("ok");
      setMsg(t("uploadSuccess"));
      router.refresh();
    } catch (e) {
      setTone("err");
      setMsg(e instanceof ApiError ? e.message : t("uploadFailed"));
    } finally {
      setBusy(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function removePhoto() {
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch<{ message: string }>("/users/me/home-image", {
        method: "DELETE",
      });
      if (objectUrl !== null) {
        URL.revokeObjectURL(objectUrl);
      }
      setObjectUrl(null);
      setPreviewOverride(null);
      setTone("ok");
      setMsg(t("deletePhotoSuccess"));
      router.refresh();
    } catch (e) {
      setTone("err");
      setMsg(e instanceof ApiError ? e.message : t("deletePhotoFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-2 lg:items-start">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void uploadFile(file);
          }
        }}
      />
      <div className="flex w-full max-w-[240px] flex-col items-center gap-2 sm:max-w-[260px] lg:max-w-[280px]">
        <button
          type="button"
          className="group relative aspect-square w-full overflow-hidden rounded-full border border-white/70 ommm-user-avatar-placeholder-surface shadow-[0_16px_40px_-24px_rgba(45,40,35,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-wait disabled:opacity-70"
          aria-label={t("chooseImage")}
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
        {previewImgSrc ? (
          previewImgSrc.startsWith("blob:") ? (
            // eslint-disable-next-line @next/next/no-img-element -- local preview before refresh
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
          <span className="flex h-full w-full items-center justify-center text-[#fbf5d5]">
            <MarketingHeaderUserIcon className="h-[44%] w-auto max-h-28 shrink-0 sm:max-h-[5rem] lg:h-[52%] lg:max-h-32" />
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-sage-900/0 px-4 text-center text-sm font-medium text-white opacity-0 transition group-hover:bg-sage-900/45 group-hover:opacity-100 group-focus-visible:bg-sage-900/45 group-focus-visible:opacity-100">
          {busy ? t("uploading") : t("chooseImage")}
        </span>
        </button>
        {hasPhoto ? (
          <OmmButton
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            className="mt-1 text-sage-600 hover:text-sage-900"
            onClick={() => void removePhoto()}
          >
            {busy ? t("removingPhoto") : t("deletePhoto")}
          </OmmButton>
        ) : null}
      </div>
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
