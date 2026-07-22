import {
  FormFieldErrorFor,
  formFieldInputClassFor,
} from "@/components/ui/form-validation";
import type { AdminCreateCoachFocusField } from "@/components/admin/admin-create-coach-form-focus";

type AdminCreateCoachFieldErrorProps = {
  field: AdminCreateCoachFocusField;
  errorField: AdminCreateCoachFocusField | null;
  message: string | null;
};

/** @deprecated Prefer {@link FormFieldErrorFor} from `@/components/ui/form-validation`. */
export function AdminCreateCoachFieldError(props: AdminCreateCoachFieldErrorProps) {
  return <FormFieldErrorFor {...props} />;
}

/** @deprecated Prefer {@link formFieldInputClassFor} from `@/components/ui/form-validation`. */
export function adminCreateCoachInputClass(
  field: AdminCreateCoachFocusField,
  errorField: AdminCreateCoachFocusField | null,
  extra = "",
): string {
  return formFieldInputClassFor(field, errorField, extra);
}
