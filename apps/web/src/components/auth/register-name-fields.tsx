import {
  FormFieldError,
  formFieldInputClassFor,
} from "@/components/ui/form-validation";
import { PSEUDO_FIRST_NAME, PSEUDO_LAST_NAME } from "@/lib/pseudo-form-placeholders";

export type RegisterNameField = "firstName" | "lastName";

type RegisterNameFieldsProps = {
  firstNameLabel: string;
  lastNameLabel: string;
  maxNameLength: number;
  errorField: RegisterNameField | null;
  errorMessage: string | null;
  onClearFieldError: (field: RegisterNameField) => void;
};

/** First / last name inputs with inline Latin-script validation messages. */
export function RegisterNameFields({
  firstNameLabel,
  lastNameLabel,
  maxNameLength,
  errorField,
  errorMessage,
  onClearFieldError,
}: RegisterNameFieldsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5">
        <span className="ommm-label">{firstNameLabel}</span>
        <input
          name="firstName"
          required
          autoComplete="given-name"
          className={formFieldInputClassFor("firstName", errorField)}
          maxLength={maxNameLength}
          placeholder={PSEUDO_FIRST_NAME}
          aria-invalid={errorField === "firstName"}
          onChange={() => {
            if (errorField === "firstName") {
              onClearFieldError("firstName");
            }
          }}
        />
        <FormFieldError
          show={errorField === "firstName"}
          message={errorMessage}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="ommm-label">{lastNameLabel}</span>
        <input
          name="lastName"
          required
          autoComplete="family-name"
          className={formFieldInputClassFor("lastName", errorField)}
          maxLength={maxNameLength}
          placeholder={PSEUDO_LAST_NAME}
          aria-invalid={errorField === "lastName"}
          onChange={() => {
            if (errorField === "lastName") {
              onClearFieldError("lastName");
            }
          }}
        />
        <FormFieldError
          show={errorField === "lastName"}
          message={errorMessage}
        />
      </label>
    </div>
  );
}
