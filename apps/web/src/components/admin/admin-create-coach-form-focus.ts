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

const SECTION_FOCUS_FIELDS = new Set<AdminCreateCoachFocusField>([
  "assignedClasses",
  "photo",
]);

function resolveFocusTarget(
  form: HTMLFormElement,
  field: AdminCreateCoachFocusField,
): HTMLElement | null {
  if (SECTION_FOCUS_FIELDS.has(field)) {
    return form.querySelector(`[data-create-coach-field="${field}"]`);
  }
  const named = form.elements.namedItem(field);
  if (named instanceof HTMLElement) {
    return named;
  }
  if (named instanceof RadioNodeList) {
    const first = named.item(0);
    return first instanceof HTMLElement ? first : null;
  }
  return null;
}

/** Scrolls the invalid field into view and focuses it when possible. */
export function focusAdminCreateCoachField(
  form: HTMLFormElement,
  field: AdminCreateCoachFocusField,
): void {
  const target = resolveFocusTarget(form, field);
  if (target === null) {
    return;
  }
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  window.requestAnimationFrame(() => {
    if (typeof target.focus === "function") {
      target.focus({ preventScroll: true });
    }
  });
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
