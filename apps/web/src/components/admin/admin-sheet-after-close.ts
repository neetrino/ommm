/**
 * Phone sheets notify via exit animation.
 * Desktop sheets now also animate inside AdminSheetPortal; prefer portal `onAfterClose`.
 * Kept for tests / callers that still branch on viewport.
 */
export function shouldNotifyDesktopSheetAfterClose(
  isPhone: boolean,
  wasOpen: boolean,
  isOpen: boolean,
): boolean {
  return !isPhone && wasOpen && !isOpen;
}
