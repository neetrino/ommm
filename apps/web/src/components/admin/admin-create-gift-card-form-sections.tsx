"use client";

import type { useTranslations } from "next-intl";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";
import { OmmButton } from "@/components/ui/omm-button";

type GiftCardFormCopy = ReturnType<typeof useTranslations<"adminPages.giftCards">>;

export function GiftCardAssignSection({
  showAssignedUser,
  setShowAssignedUser,
  recipientId,
  setRecipientId,
  message,
  setMessage,
  recipientOptions,
  busy,
  t,
}: {
  showAssignedUser: boolean;
  setShowAssignedUser: React.Dispatch<React.SetStateAction<boolean>>;
  recipientId: string;
  setRecipientId: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  recipientOptions: readonly DropdownOption<string>[];
  busy: boolean;
  t: GiftCardFormCopy;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-white/70 bg-white/55 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldAssignedUser")}</span>
        <OmmButton
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => toggleAssignedUser(showAssignedUser, setShowAssignedUser, setRecipientId)}
        >
          {showAssignedUser ? t("hideAssignedUserButton") : t("showAssignedUserButton")}
        </OmmButton>
      </div>
      {showAssignedUser ? (
        <AssignedUserFields
          recipientId={recipientId}
          setRecipientId={setRecipientId}
          message={message}
          setMessage={setMessage}
          recipientOptions={recipientOptions}
          busy={busy}
          t={t}
        />
      ) : (
        <p className="text-sm leading-relaxed text-sage-600">{t("fieldAssignedUserHiddenHint")}</p>
      )}
    </div>
  );
}

function toggleAssignedUser(
  shown: boolean,
  setShown: React.Dispatch<React.SetStateAction<boolean>>,
  setRecipientId: (value: string) => void,
): void {
  if (shown) {
    setRecipientId("");
  }
  setShown(!shown);
}

function AssignedUserFields({
  recipientId,
  setRecipientId,
  message,
  setMessage,
  recipientOptions,
  busy,
  t,
}: {
  recipientId: string;
  setRecipientId: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  recipientOptions: readonly DropdownOption<string>[];
  busy: boolean;
  t: GiftCardFormCopy;
}) {
  return (
    <div className="grid gap-3">
      <DropdownSelect
        label={t("fieldAssignedUserPlaceholder")}
        ariaLabel={t("fieldAssignedUser")}
        value={recipientId}
        options={recipientOptions}
        onChange={setRecipientId}
        disabled={busy}
        wrapLabel
        searchable
        searchPlaceholder={t("actions.assignSearchPlaceholder")}
        noResultsLabel={t("actions.assignSearchEmpty")}
      />
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldMessage")}</span>
        <textarea
          className="ommm-input min-h-24 resize-y"
          placeholder={t("fieldMessagePlaceholder")}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={busy}
        />
      </label>
    </div>
  );
}

export function GiftCardImageField({
  imageInputRef,
  imageFile,
  imagePreviewUrl,
  onImageChange,
  busy,
  t,
}: {
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  busy: boolean;
  t: GiftCardFormCopy;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldImage")}</span>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="sr-only"
        onChange={onImageChange}
        disabled={busy}
      />
      <button
        type="button"
        className="flex w-full items-center gap-4 rounded-[20px] border border-dashed border-sand-400/80 bg-gradient-to-br from-sand-50 via-paper to-mint-50 p-3 text-left transition-colors hover:border-sand-500 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={busy}
        onClick={() => imageInputRef.current?.click()}
      >
        <GiftCardImageThumb previewUrl={imagePreviewUrl} alt={t("fieldImagePreviewAlt")} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-sage-900">
            {imageFile?.name ?? t("fieldImageChoose")}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-sage-500">{t("fieldImageHint")}</span>
        </span>
      </button>
    </div>
  );
}

function GiftCardImageThumb({ previewUrl, alt }: { previewUrl: string | null; alt: string }) {
  return (
    <span className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/80 bg-white/80 font-serif text-lg text-sage-400">
      {previewUrl === null ? (
        "֏"
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- preview image supports blob/object URLs
        <img src={previewUrl} alt={alt} className="h-full w-full object-cover" />
      )}
    </span>
  );
}
