import type { ReactNode } from "react";

/** Renders `@` in UI sans so it matches surrounding copy weight in display/serif strings. */
export function renderAtSignText(text: string, atSignClassName: string): ReactNode {
  const atIndex = text.indexOf("@");
  if (atIndex === -1) {
    return text;
  }

  return (
    <>
      {text.slice(0, atIndex)}
      <span className={atSignClassName}>@</span>
      {text.slice(atIndex + 1)}
    </>
  );
}
