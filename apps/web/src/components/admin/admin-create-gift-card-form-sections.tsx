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
