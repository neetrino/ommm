import { focusFormField } from "@/components/ui/form-validation";

/** Form control / section to scroll into view on create-coach validation errors. */
export type AdminCreateCoachFocusField =
  | "name"
  | "lastName"
  | "email"
  | "phone"
  | "password"
  | "birthday"
  | "age"
  | "bio"
  | "specialization"
  | "experienceYears"
  | "assignedClasses"
  | "photo";

/** Scrolls the invalid field into view and focuses it when possible. */
export function focusAdminCreateCoachField(
  form: HTMLFormElement,
  field: AdminCreateCoachFocusField,
): void {
  const sectionFields: AdminCreateCoachFocusField[] = ["assignedClasses", "photo"];
  if (sectionFields.includes(field)) {
    const legacy = form.querySelector(`[data-create-coach-field="${field}"]`);
    if (legacy instanceof HTMLElement && !legacy.hasAttribute("data-form-field")) {
      legacy.setAttribute("data-form-field", field);
    }
  }
  focusFormField(form, field);
}

/** Maps API conflict / validation messages to the field the user should edit. */
export function resolveAdminCreateCoachApiFocusField(
  message: string,
): AdminCreateCoachFocusField | null {
  const normalized = message.toLowerCase();
  if (normalized.includes("phone")) {
    return "phone";
  }
  if (normalized.includes("email")) {
    return "email";
  }
  if (normalized.includes("specialization")) {
    return "specialization";
  }
  if (normalized.includes("assigned class") || normalized.includes("class type")) {
    return "assignedClasses";
  }
  if (normalized.includes("photo")) {
    return "photo";
  }
  if (normalized.includes("birthday") || normalized.includes("date of birth")) {
    return "birthday";
  }
  if (normalized.includes("age")) {
    return "age";
  }
  return null;
}

/** Localizes known create-coach API conflict messages for the active UI locale. */
export function localizeAdminCreateCoachApiError(
  message: string,
  t: (key: string) => string,
): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("phone") && normalized.includes("already")) {
    return t("phoneAlreadyExists");
  }
  if (normalized.includes("email") && normalized.includes("already")) {
    return t("emailAlreadyExists");
  }
  return message;
}
