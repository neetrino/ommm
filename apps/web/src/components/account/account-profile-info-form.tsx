"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateForUi } from "@/lib/date-display";
import { EditActionButton } from "@/components/ui/edit-action-button";
import { OmmButton } from "@/components/ui/omm-button";
import { DatePickerInput } from "@/components/ui/date-picker-input";

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
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
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
      await apiFetch<{ user: ProfileFormUser }>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          email,
          name: name === "" ? null : name,
          lastName: lastName === "" ? null : lastName,
          phone: phone === "" ? null : phone,
          dateOfBirth: form.dateOfBirth === "" ? null : form.dateOfBirth,
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
        <dl className="space-y-3 pr-14 text-sm">
          <div>
            <dt className="text-sage-500">{tProfile("labels.email")}</dt>
            <dd className="font-medium text-sage-800">{initialUser.email}</dd>
          </div>
          <div>
            <dt className="text-sage-500">{tProfile("labels.name")}</dt>
            <dd className="text-sage-700">{initialUser.name ?? empty}</dd>
          </div>
          <div>
            <dt className="text-sage-500">{tProfile("labels.lastName")}</dt>
            <dd className="text-sage-700">{initialUser.lastName ?? empty}</dd>
          </div>
          <div>
            <dt className="text-sage-500">{tProfile("labels.phone")}</dt>
            <dd className="text-sage-700">{initialUser.phone ?? empty}</dd>
          </div>
          <div>
            <dt className="text-sage-500">{tProfile("labels.dateOfBirth")}</dt>
            <dd className="text-sage-700">
              {initialUser.dateOfBirth
                ? formatDateForUi(initialUser.dateOfBirth)
                : empty}
            </dd>
          </div>
          {showRole ? (
            <div>
              <dt className="text-sage-500">{tStaff("role")}</dt>
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
      className="flex max-w-xl flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <div className="space-y-1">
        <label className="text-sm font-medium text-sage-700" htmlFor="profile-email">
          {tProfile("labels.email")}
        </label>
        <input
          id="profile-email"
          type="email"
          autoComplete="email"
          className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          disabled={isSaving}
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-sage-700" htmlFor="profile-name">
          {tProfile("labels.name")}
        </label>
        <input
          id="profile-name"
          type="text"
          autoComplete="given-name"
          className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          disabled={isSaving}
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-sage-700" htmlFor="profile-last-name">
          {tProfile("labels.lastName")}
        </label>
        <input
          id="profile-last-name"
          type="text"
          autoComplete="family-name"
          className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
          value={form.lastName}
          onChange={(event) => updateField("lastName", event.target.value)}
          disabled={isSaving}
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-sage-700" htmlFor="profile-phone">
          {tProfile("labels.phone")}
        </label>
        <input
          id="profile-phone"
          type="tel"
          autoComplete="tel"
          className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
          value={form.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          disabled={isSaving}
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-sage-700" htmlFor="profile-dob">
          {tProfile("labels.dateOfBirth")}
        </label>
        <DatePickerInput
          id="profile-dob"
          name="dateOfBirth"
          ariaLabel={tProfile("labels.dateOfBirth")}
          placeholder={tProfile("labels.dateOfBirth")}
          value={form.dateOfBirth}
          onChange={(nextValue) => updateField("dateOfBirth", nextValue)}
          disabled={isSaving}
        />
      </div>

      <div className="flex flex-wrap gap-3">
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
        <p className={`text-sm ${tone === "ok" ? "text-sage-600" : "text-red-800"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
