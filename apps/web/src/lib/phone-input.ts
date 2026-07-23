import {
  formatPhoneInputValue,
  mapPhoneInputCursor,
} from "@/lib/phone";

export { formatPhoneInputValue as formatPhoneInput } from "@/lib/phone";

/** Applies live phone formatting to a controlled input and restores cursor position. */
export function applyPhoneInputChange(
  input: HTMLInputElement,
  nextValue: string,
): string {
  const previousValue = input.value;
  const cursor = input.selectionStart ?? previousValue.length;
  const formatted = formatPhoneInputValue(nextValue);

  if (formatted !== input.value) {
    input.value = formatted;
  }

  const nextCursor = mapPhoneInputCursor(previousValue, formatted, cursor);
  input.setSelectionRange(nextCursor, nextCursor);
  return formatted;
}

/** Sanitizes an uncontrolled phone `<input>` in place when pasted or typed. */
export function syncPhoneInputElement(input: HTMLInputElement): void {
  applyPhoneInputChange(input, input.value);
}
