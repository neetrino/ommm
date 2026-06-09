/** Blur the focused field so the mobile software keyboard closes. */
export function dismissMobileKeyboard(): void {
  if (typeof document === "undefined") {
    return;
  }

  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) {
    return;
  }

  if (
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement ||
    active instanceof HTMLSelectElement ||
    active.isContentEditable
  ) {
    active.blur();
  }
}
