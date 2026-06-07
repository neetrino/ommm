import { parseBirthdayDisplayToIso } from "@/lib/date-display";
import type { ClientEditFormErrors, ClientEditFormState } from "@/components/admin/admin-client-edit-form.types";

type ClientValidationLabels = {
  emailRequired: string;
  emailInvalid: string;
  birthdayInvalid: string;
};

export type ClientUpdatePayload = {
  email: string;
  name: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
};

type ValidateClientFormArgs = {
  form: ClientEditFormState;
  labels: ClientValidationLabels;
};

export function validateClientEditForm({
  form,
  labels,
}: ValidateClientFormArgs): { errors: ClientEditFormErrors; payload: ClientUpdatePayload | null } {
  const errors: ClientEditFormErrors = {};
  const email = form.email.trim().toLowerCase();

  if (email === "") {
    errors.email = labels.emailRequired;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = labels.emailInvalid;
  }

  const birthdayDisplay = form.dateOfBirth.trim();
  let dateOfBirth = "";
  if (birthdayDisplay !== "") {
    const birthdayIso = parseBirthdayDisplayToIso(birthdayDisplay);
    if (birthdayIso === null) {
      errors.dateOfBirth = labels.birthdayInvalid;
    } else {
      dateOfBirth = birthdayIso;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors, payload: null };
  }

  return {
    errors,
    payload: {
      email,
      name: form.name.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      dateOfBirth,
    },
  };
}
