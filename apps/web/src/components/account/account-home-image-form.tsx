"use client";

import { useRouter } from "@/i18n/navigation";
import { useRef, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { OmmButton } from "@/components/ui/omm-button";

const MAX_BYTES = 5 * 1024 * 1024;

const ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

/**
 * Restricts values bound to `<img src>` so stored or reflected strings cannot
 * use executable URL schemes (e.g. `javascript:`). CodeQL: js/xss-through-dom.
 */
function isAllowedHomePreviewSrc(src: string): boolean {
  const trimmed = src.trim();
  if (trimmed === "") {
    return false;
  }
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return false;
  }
  return (
    url.protocol === "https:" ||
    url.protocol === "http:" ||
    url.protocol === "blob:"
  );
}

function readFileAsHomeImageJsonPayload(
  file: File,
): Promise<{ imageBase64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = reader.result;
      if (typeof s !== "string") {
        reject(new Error("Could not read image"));
        return;
      }
      const i = s.indexOf("base64,");
      if (i === -1) {
        reject(new Error("Could not read image"));
        return;
      }
      resolve({
        imageBase64: s.slice(i + "base64,".length),
        mimeType: file.type || "image/jpeg",
      });
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error("Could not read image"));
    };
    reader.readAsDataURL(file);
  });
}

type Props = {
  initialPreviewUrl?: string | null;
};

export function AccountHomeImageForm({ initialPreviewUrl }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [file, setFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const rawPreview = objectUrl ?? initialPreviewUrl ?? null;
  const previewSrc =
    rawPreview !== null && isAllowedHomePreviewSrc(rawPreview)
      ? rawPreview
      : null;

  function onFileChosen(next: File | null) {
    if (objectUrl !== null) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
    setFile(next);
    if (next !== null) {
      setObjectUrl(URL.createObjectURL(next));
    }
  }

  async function upload() {
    setBusy(true);
    setMsg(null);
    try {
      if (file === null) {
        setTone("err");
        setMsg("Choose an image first.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setTone("err");
        setMsg("Image is too large. Maximum size is 5 MB.");
        return;
      }
      const payload = await readFileAsHomeImageJsonPayload(file);
      await apiFetch<{ message: string }>("/users/me/home-image-json", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setTone("ok");
      setMsg("Home image updated successfully.");
      onFileChosen(null);
      router.refresh();
    } catch (e) {
      setTone("err");
      setMsg(e instanceof ApiError ? e.message : "Could not upload image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(ev) => {
          const f = ev.target.files?.[0] ?? null;
          onFileChosen(f);
        }}
      />

      {previewSrc ? (
        <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[24px] border border-white/70 bg-sage-900 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element -- dynamic blob + API URLs */}
          <img
            src={previewSrc}
            alt="Home image preview"
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <p className="text-sm italic text-sage-500">
          No custom image — your dashboard uses the default layout.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <OmmButton
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          Choose image
        </OmmButton>
        <OmmButton
          type="button"
          variant="primary"
          size="sm"
          disabled={busy || file === null}
          onClick={() => void upload()}
        >
          {busy ? "Uploading…" : "Upload"}
        </OmmButton>
      </div>

      {msg ? (
        <p className={`text-sm ${tone === "ok" ? "text-sage-600" : "text-red-800"}`}>{msg}</p>
      ) : null}
    </div>
  );
}
