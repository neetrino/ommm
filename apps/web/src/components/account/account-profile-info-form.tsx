"use client";

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

  if (!isEditing) {
    return (
      <div className="relative space-y-4">
        <div className="absolute right-0 top-0">
          <EditActionButton
            ariaLabel={tForm("edit")}
            title={tForm("edit")}
            onClick={startEdit}
          />
        </div>
        <dl className="grid grid-cols-1 gap-3 pr-12 sm:grid-cols-2">
          <div className="ommm-inset-row">
            <dt className="text-xs text-sage-500">{tProfile("labels.name")}</dt>
            <dd className="font-medium text-sage-800">{initialUser.name ?? empty}</dd>
          </div>
          <div className="ommm-inset-row">
            <dt className="text-xs text-sage-500">{tProfile("labels.lastName")}</dt>
            <dd className="font-medium text-sage-800">{initialUser.lastName ?? empty}</dd>
          </div>
          <div className="ommm-inset-row sm:col-span-2">
            <dt className="text-xs text-sage-500">{tProfile("labels.email")}</dt>
            <dd className="text-sage-700">{initialUser.email}</dd>
          </div>
          <div className="ommm-inset-row">
            <dt className="text-xs text-sage-500">{tProfile("labels.phone")}</dt>
            <dd className="text-sage-700">{initialUser.phone ?? empty}</dd>
          </div>
          <div className="ommm-inset-row">
            <dt className="text-xs text-sage-500">{tProfile("labels.dateOfBirth")}</dt>
            <dd className="text-sage-700">
              {initialUser.dateOfBirth
                ? formatDateForUi(initialUser.dateOfBirth)
                : empty}
            </dd>
          </div>
          {showRole ? (
            <div className="ommm-inset-row sm:col-span-2">
              <dt className="text-xs text-sage-500">{tStaff("role")}</dt>
              <dd className="text-sage-700">{initialUser.role ?? empty}</dd>
            </div>
          ) : null}
        </dl>
        {message ? (
          <p className={`text-sm ${tone === "ok" ? "text-sage-600" : "text-red-800"}`}>
            {message}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <div className="space-y-1">
        <label className="ommm-label" htmlFor="profile-name">
          {tProfile("labels.name")}
        </label>
        <input
          id="profile-name"
          type="text"
          autoComplete="given-name"
          className="ommm-input"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          disabled={isSaving}
        />
      </div>
      <div className="space-y-1">
        <label className="ommm-label" htmlFor="profile-last-name">
          {tProfile("labels.lastName")}
        </label>
        <input
          id="profile-last-name"
          type="text"
          autoComplete="family-name"
          className="ommm-input"
          value={form.lastName}
          onChange={(event) => updateField("lastName", event.target.value)}
          disabled={isSaving}
        />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <label className="ommm-label" htmlFor="profile-email">
          {tProfile("labels.email")}
        </label>
        <input
          id="profile-email"
          type="email"
          autoComplete="email"
          className="ommm-input"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          disabled={isSaving}
        />
      </div>
      <div className="space-y-1">
        <label className="ommm-label" htmlFor="profile-phone">
          {tProfile("labels.phone")}
        </label>
        <input
          id="profile-phone"
          type="tel"
          autoComplete="tel"
          className="ommm-input"
          value={form.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          disabled={isSaving}
        />
      </div>
      <div className="space-y-1">
        <label className="ommm-label" htmlFor="profile-dob">
          {tProfile("labels.dateOfBirth")}
        </label>
        <input
          id="profile-dob"
          name="dateOfBirth"
          type="text"
          inputMode="numeric"
          autoComplete="bday"
          placeholder="DD/MM/YYYY"
          className="ommm-input"
          value={form.dateOfBirth}
          onChange={(event) => updateField("dateOfBirth", formatBirthdayInput(event.target.value))}
          disabled={isSaving}
        />
      </div>

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

      {message ? (
        <p className={`sm:col-span-2 text-sm ${tone === "ok" ? "text-sage-600" : "text-red-800"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
