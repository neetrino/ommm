const OPTIONAL_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Empty is valid; non-empty must look like an email address. */
export function isOptionalEmailValid(email: string): boolean {
  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return true;
  }
  return OPTIONAL_EMAIL_PATTERN.test(trimmed);
}

/** Empty is valid; non-empty must be an http(s) URL. */
export function isOptionalHttpUrl(url: string): boolean {
  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export type StudioSettingsFieldErrors = Partial<
  Record<
    | "contactEmail"
    | "whatsappUrl"
    | "mapEmbedUrl"
    | "instagramUrl"
    | "facebookUrl",
    string
  >
>;

type CollectStudioFieldErrorsInput = {
  contactEmail: string;
  whatsappUrl: string;
  mapEmbedUrl: string;
  instagramUrl: string;
  facebookUrl: string;
};

type CollectStudioFieldErrorsMessages = {
  invalidEmail: string;
  invalidUrl: string;
};

export function collectStudioSettingsFieldErrors(
  values: CollectStudioFieldErrorsInput,
  messages: CollectStudioFieldErrorsMessages,
): StudioSettingsFieldErrors {
  const errors: StudioSettingsFieldErrors = {};

  if (!isOptionalEmailValid(values.contactEmail)) {
    errors.contactEmail = messages.invalidEmail;
  }
  if (!isOptionalHttpUrl(values.whatsappUrl)) {
    errors.whatsappUrl = messages.invalidUrl;
  }
  if (!isOptionalHttpUrl(values.mapEmbedUrl)) {
    errors.mapEmbedUrl = messages.invalidUrl;
  }
  if (!isOptionalHttpUrl(values.instagramUrl)) {
    errors.instagramUrl = messages.invalidUrl;
  }
  if (!isOptionalHttpUrl(values.facebookUrl)) {
    errors.facebookUrl = messages.invalidUrl;
  }

  return errors;
}
