"use client";

import Image from "next/image";
import { useRef } from "react";
import { ACCEPT_PHOTO } from "@/components/admin/admin-coach-form-helpers";

type AdminCoachEditableCardImageProps = {
  previewSrc: string | null;
  busy: boolean;
  label: string;
  chooseLabel: string;
  uploadingLabel: string;
  removeLabel: string;
  hint: string;
  onSelect: (file: File) => void;
  onRemove: () => void;
  showRemove: boolean;
};

const CARD_BUTTON_CLASS =
  "group relative aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-2xl border border-white/70 bg-sand-100 shadow-[0_12px_32px_-20px_rgba(45,40,35,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-wait disabled:opacity-70 sm:w-32";

/** Tall portrait upload for the public coaches page (separate from list avatar). */
export function AdminCoachEditableCardImage({
  previewSrc,
  busy,
  label,
  chooseLabel,
  uploadingLabel,
  removeLabel,
  hint,
  onSelect,
  onRemove,
  showRemove,
}: AdminCoachEditableCardImageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isBlobPreview = previewSrc !== null && previewSrc.startsWith("blob:");

  return (
    <div className="min-w-0 flex-1">
      <p className="ommm-label text-xs uppercase tracking-wide text-sage-700">{label}</p>
      <p className="mt-1 text-xs text-sage-500">{hint}</p>
      <div className="relative mt-3 inline-block">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_PHOTO}
          className="sr-only"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onSelect(file);
            }
            event.target.value = "";
          }}
        />
        <button
          type="button"
          className={CARD_BUTTON_CLASS}
          aria-label={chooseLabel}
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {previewSrc !== null ? (
            isBlobPreview ? (
              // eslint-disable-next-line @next/next/no-img-element -- local preview before refresh
              <img src={previewSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <Image
                src={previewSrc}
                alt=""
                fill
                sizes="128px"
                className="object-cover"
                unoptimized
              />
            )
          ) : (
            <span className="flex h-full w-full items-center justify-center px-2 text-center text-xs font-medium text-sage-600">
              {chooseLabel}
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-sage-900/0 px-2 text-center text-xs font-medium text-white opacity-0 transition group-hover:bg-sage-900/45 group-hover:opacity-100 group-focus-visible:bg-sage-900/45 group-focus-visible:opacity-100">
            {busy ? uploadingLabel : chooseLabel}
          </span>
        </button>
        {showRemove && !busy ? (
          <button
            type="button"
            className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-white/95 text-sm text-sage-700 shadow-sm hover:bg-sand-50"
            aria-label={removeLabel}
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
}
