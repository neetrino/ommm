import { buildClassTypeSlugFromName } from "@/lib/class-type-slug";
import type { AdminClassTypeRow } from "@/components/admin/admin-class-types-types";
import type {
  ClassTypeEditFormErrors,
  ClassTypeEditFormState,
} from "@/components/admin/admin-class-type-edit-form.types";

export const CLASS_TYPE_MAX_NAME_LENGTH = 120;
export const CLASS_TYPE_MAX_DESCRIPTION_LENGTH = 4000;

type ValidationLabels = {
  nameRequired: string;
  nameTooLong: string;
  nameDuplicate: string;
  slugInvalid: string;
  descriptionTooLong: string;
};

type ValidateClassTypeFormArgs = {
  form: ClassTypeEditFormState;
  typeId: string | null;
  existingTypes: readonly AdminClassTypeRow[];
  labels: ValidationLabels;
};

export function validateClassTypeForm({
  form,
  typeId,
  existingTypes,
  labels,
}: ValidateClassTypeFormArgs): {
  errors: ClassTypeEditFormErrors;
  payload: { name: string; slug: string; description: string | null } | null;
} {
  const trimmedName = form.name.trim();
  const trimmedDescription = form.description.trim();
  const errors: ClassTypeEditFormErrors = {};

  if (trimmedName.length === 0) {
    errors.name = labels.nameRequired;
  } else if (trimmedName.length > CLASS_TYPE_MAX_NAME_LENGTH) {
    errors.name = labels.nameTooLong;
  } else {
    const slug = buildClassTypeSlugFromName(trimmedName);
    if (slug.length === 0) {
      errors.name = labels.slugInvalid;
    } else {
      const duplicate = existingTypes.some(
        (row) =>
          row.id !== typeId &&
          row.name.trim().toLowerCase() === trimmedName.toLowerCase(),
      );
      if (duplicate) {
        errors.name = labels.nameDuplicate;
      }
    }
  }

  if (trimmedDescription.length > CLASS_TYPE_MAX_DESCRIPTION_LENGTH) {
    errors.description = labels.descriptionTooLong;
  }

  if (errors.name !== undefined || errors.description !== undefined) {
    return { errors, payload: null };
  }

  const slug = buildClassTypeSlugFromName(trimmedName);
  return {
    errors,
    payload: {
      name: trimmedName,
      slug,
      description: trimmedDescription.length > 0 ? trimmedDescription : null,
    },
  };
}
