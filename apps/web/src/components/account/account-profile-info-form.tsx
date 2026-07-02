"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { AccountProfileField } from "@/components/account/account-profile-field";
import {
  accountProfileInitialFormState,
  formatPhoneDisplay,
} from "@/components/account/account-profile-info-form.helpers";
import type {
  AccountProfileFormState,
  AccountProfileInfoFormProps,
} from "@/components/account/account-profile-info-form.types";
import { MAX_BIO_LENGTH } from "@/components/admin/admin-coach-form-helpers";
import { ApiError, apiFetch } from "@/lib/api";
import {
  formatBirthdayInput,
  formatDateForUi,
  parseBirthdayDisplayToIso,
} from "@/lib/date-display";
import { normalizePhoneForApi } from "@/lib/phone";
import { EditActionButton } from "@/components/ui/edit-action-button";
import { OmmButton } from "@/components/ui/omm-button";
import { dismissMobileKeyboard } from "@/lib/dismiss-mobile-keyboard";
import { useRouter } from "@/i18n/navigation";
import type { ProfileFormUser } from "@/components/account/account-profile-info-form.types";

export type { AccountProfileInfoFormProps, ProfileFormUser } from "@/components/account/account-profile-info-form.types";

export function AccountProfileInfoForm({
  initialUser,
  showRole = false,
  coachProfileId = null,
  initialBio,
}: AccountProfileInfoFormProps) {
  const tProfile = useTranslations("userPages.profile");
  const tForm = useTranslations("forms.profileEdit");
  const tStaff = useTranslations("staffProfile.fields");
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [form, setForm] = useState<AccountProfileFormState>(() =>
    accountProfileInitialFormState(initialUser, initialBio),
  );
  const [savedBio, setSavedBio] = useState<string | null>(null);
  const showCoachBio = coachProfileId !== null && coachProfileId.length > 0;

  const empty = tProfile("emptyValue");

  function resetFormState() {
    setForm(accountProfileInitialFormState(initialUser, initialBio));
  }

  function updateField<K extends keyof AccountProfileFormState>(key: K, value: AccountProfileFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit() {
    setMessage(null);
    resetFormState();
    setIsEditing(true);
  }

  function cancelEdit() {
    dismissMobileKeyboard();
    resetFormState();
    setMessage(null);
    setIsEditing(false);
  }

  async function saveCoachBio(): Promise<void> {
    if (!showCoachBio || coachProfileId === null) {
      return;
    }
    const bioTrimmed = form.bio.trim();
    await apiFetch<{ bio: string | null }>(`/coaches/${coachProfileId}`, {
      method: "PATCH",
      body: JSON.stringify({
        bio: bioTrimmed === "" ? null : bioTrimmed,
      }),
    });
  }

  async function save() {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    setMessage(null);
    try {
      const email = form.email.trim().toLowerCase();
      const name = form.name.trim();
      const lastName = form.lastName.trim();
      const phone = form.phone.trim();
      if (email === "") {
        setTone("err");
        setMessage(tForm("emailRequired"));
        return;
      }
      const dateOfBirthDisplay = form.dateOfBirth.trim();
      const dateOfBirth =
        dateOfBirthDisplay === "" ? null : parseBirthdayDisplayToIso(dateOfBirthDisplay);
      if (dateOfBirthDisplay !== "" && dateOfBirth === null) {
        setTone("err");
        setMessage(tForm("dateOfBirthInvalid"));
        return;
      }
      if (showCoachBio) {
        const bioTrimmed = form.bio.trim();
        if (bioTrimmed.length > MAX_BIO_LENGTH) {
          setTone("err");
          setMessage(tForm("bioTooLong"));
          return;
        }
      }
      await apiFetch<{ user: ProfileFormUser }>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          email,
          name: name === "" ? null : name,
          lastName: lastName === "" ? null : lastName,
          phone: phone === "" ? null : normalizePhoneForApi(phone),
          dateOfBirth,
        }),
      });
      if (showCoachBio) {
        try {
          await saveCoachBio();
          setSavedBio(form.bio.trim());
        } catch (error) {
          setTone("err");
          setMessage(error instanceof ApiError ? error.message : tForm("bioSaveFailed"));
          router.refresh();
          return;
        }
      }
      setTone("ok");
      setMessage(tForm("saveSuccess"));
      dismissMobileKeyboard();
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : tForm("saveFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  const displayDob = initialUser.dateOfBirth
    ? formatDateForUi(initialUser.dateOfBirth)
    : empty;
  const trimmedInitialBio = initialBio?.trim() ?? "";
  const displayBio =
    savedBio !== null && trimmedInitialBio !== savedBio
      ? savedBio
      : trimmedInitialBio;

  let actions: ReactNode = null;
  if (isEditing) {
    actions = (
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <OmmButton type="submit" variant="primary" size="sm" disabled={isSaving}>
          {isSaving ? tForm("saving") : tForm("save")}
        </OmmButton>
        <OmmButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={cancelEdit}
          disabled={isSaving}
        >
          {tForm("cancel")}
        </OmmButton>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      {!isEditing ? (
        <div className="absolute right-0 top-0">
          <EditActionButton
            ariaLabel={tForm("edit")}
            title={tForm("edit")}
            onClick={startEdit}
          />
        </div>
      ) : null}

      <form
        className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${isEditing ? "" : "pr-12"}`.trim()}
        onSubmit={(event) => {
          event.preventDefault();
          if (isEditing) {
            void save();
          }
        }}
      >
        <AccountProfileField
          id="profile-name"
          label={tProfile("labels.name")}
          displayValue={initialUser.name ?? ""}
          editing={isEditing}
          inputValue={form.name}
          onChange={(value) => updateField("name", value)}
          autoComplete="given-name"
          disabled={isSaving}
          emptyLabel={empty}
        />
        <AccountProfileField
          id="profile-last-name"
          label={tProfile("labels.lastName")}
          displayValue={initialUser.lastName ?? ""}
          editing={isEditing}
          inputValue={form.lastName}
          onChange={(value) => updateField("lastName", value)}
          autoComplete="family-name"
          disabled={isSaving}
          emptyLabel={empty}
        />
        <AccountProfileField
          id="profile-email"
          label={tProfile("labels.email")}
          displayValue={initialUser.email}
          editing={isEditing}
          inputValue={form.email}
          onChange={(value) => updateField("email", value)}
          span={2}
          type="email"
          autoComplete="email"
          disabled={isSaving}
          emptyLabel={empty}
        />
        <AccountProfileField
          id="profile-phone"
          label={tProfile("labels.phone")}
          displayValue={formatPhoneDisplay(initialUser.phone)}
          editing={isEditing}
          inputValue={form.phone}
          onChange={(value) => updateField("phone", value)}
          usePhoneInput
          disabled={isSaving}
          emptyLabel={empty}
        />
        <AccountProfileField
          id="profile-dob"
          label={tProfile("labels.dateOfBirth")}
          displayValue={displayDob === empty ? "" : displayDob}
          editing={isEditing}
          inputValue={form.dateOfBirth}
          onChange={(value) => updateField("dateOfBirth", formatBirthdayInput(value))}
          inputMode="numeric"
          autoComplete="bday"
          placeholder="DD/MM/YYYY"
          disabled={isSaving}
          emptyLabel={empty}
        />
        {showCoachBio ? (
          <AccountProfileField
            id="profile-bio"
            label={tProfile("labels.bio")}
            displayValue={displayBio}
            editing={isEditing}
            inputValue={form.bio}
            onChange={(value) => updateField("bio", value)}
            span={2}
            multiline
            maxLength={MAX_BIO_LENGTH}
            disabled={isSaving}
            emptyLabel={empty}
          />
        ) : null}
        {showRole ? (
          <AccountProfileField
            id="profile-role"
            label={tStaff("role")}
            displayValue={initialUser.role ?? ""}
            editing={isEditing}
            inputValue={initialUser.role ?? ""}
            span={2}
            readOnly
            emptyLabel={empty}
          />
        ) : null}
        {actions}
      </form>

      {message ? (
        <p className={`text-sm ${tone === "ok" ? "text-sage-600" : "text-red-800"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
