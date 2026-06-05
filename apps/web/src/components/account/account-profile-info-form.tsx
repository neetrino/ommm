"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import {
  formatBirthdayInput,
  formatDateForUi,
  formatIsoDateToUi,
  parseBirthdayDisplayToIso,
} from "@/lib/date-display";
import { EditActionButton } from "@/components/ui/edit-action-button";
import { OmmButton } from "@/components/ui/omm-button";

const PROFILE_FIELD_CELL_CLASS = "ommm-inset-row flex flex-col gap-0.5";
const PROFILE_FIELD_LABEL_CLASS = "text-xs text-sage-500";
const PROFILE_FIELD_VALUE_CLASS = "text-sm font-medium text-sage-800";
const PROFILE_FIELD_VALUE_EMPTY_CLASS = "text-sm italic text-sage-500";
const PROFILE_FIELD_INPUT_CLASS =
  "w-full border-0 bg-transparent p-0 text-sm font-medium text-sage-800 shadow-none outline-none focus:ring-0 placeholder:font-normal placeholder:text-sage-400 disabled:cursor-not-allowed disabled:opacity-60";

type ProfileFormUser = {
  email: string;
  name: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth?: string | null;
  locale: string;
  role?: string;
};

type AccountProfileInfoFormProps = {
  initialUser: ProfileFormUser;
  showRole?: boolean;
};

type FormState = {
  email: string;
  name: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
};

type ProfileFieldProps = {
  id: string;
  label: string;
  displayValue: string;
  editing: boolean;
  inputValue: string;
  onChange?: (value: string) => void;
  span?: 1 | 2;
  readOnly?: boolean;
  disabled?: boolean;
  emptyLabel: string;
} & Pick<InputHTMLAttributes<HTMLInputElement>, "type" | "autoComplete" | "inputMode" | "placeholder">;

function ProfileField({
  id,
  label,
  displayValue,
  editing,
  inputValue,
  onChange,
  span = 1,
  readOnly = false,
  disabled = false,
  emptyLabel,
  type = "text",
  autoComplete,
  inputMode,
  placeholder,
}: ProfileFieldProps) {
  const isEmpty = displayValue.trim() === "";
  const spanClass = span === 2 ? "sm:col-span-2" : "";

  return (
    <div className={`${PROFILE_FIELD_CELL_CLASS} ${spanClass}`.trim()}>
      <label className={PROFILE_FIELD_LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      {editing && !readOnly ? (
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          inputMode={inputMode}
          placeholder={placeholder}
          className={PROFILE_FIELD_INPUT_CLASS}
          value={inputValue}
          onChange={(event) => onChange?.(event.target.value)}
          disabled={disabled}
        />
      ) : (
        <p className={isEmpty ? PROFILE_FIELD_VALUE_EMPTY_CLASS : PROFILE_FIELD_VALUE_CLASS}>
          {isEmpty ? emptyLabel : displayValue}
        </p>
      )}
    </div>
  );
}

function initialFormState(user: ProfileFormUser): FormState {
  return {
    email: user.email,
    name: user.name ?? "",
    lastName: user.lastName ?? "",
    phone: user.phone ?? "",
    dateOfBirth: formatIsoDateToUi(user.dateOfBirth),
  };
}

export function AccountProfileInfoForm({
  initialUser,
  showRole = false,
}: AccountProfileInfoFormProps) {
  const tProfile = useTranslations("userPages.profile");
  const tForm = useTranslations("forms.profileEdit");
  const tStaff = useTranslations("staffProfile.fields");
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [form, setForm] = useState<FormState>(() => initialFormState(initialUser));

  const empty = tProfile("emptyValue");

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit() {
    setMessage(null);
    setForm(initialFormState(initialUser));
    setIsEditing(true);
  }

  function cancelEdit() {
    setForm(initialFormState(initialUser));
    setMessage(null);
    setIsEditing(false);
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
      await apiFetch<{ user: ProfileFormUser }>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          email,
          name: name === "" ? null : name,
          lastName: lastName === "" ? null : lastName,
          phone: phone === "" ? null : phone,
          dateOfBirth,
        }),
      });
      setTone("ok");
      setMessage(tForm("saveSuccess"));
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
        <ProfileField
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
        <ProfileField
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
        <ProfileField
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
        <ProfileField
          id="profile-phone"
          label={tProfile("labels.phone")}
          displayValue={initialUser.phone ?? ""}
          editing={isEditing}
          inputValue={form.phone}
          onChange={(value) => updateField("phone", value)}
          type="tel"
          autoComplete="tel"
          disabled={isSaving}
          emptyLabel={empty}
        />
        <ProfileField
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
        {showRole ? (
          <ProfileField
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
