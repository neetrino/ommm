/**
 * Phone sheets notify via exit animation. Desktop unmounts immediately,
 * so the parent dismiss must run on the open → closed transition.
 */
export function shouldNotifyDesktopSheetAfterClose(
  isPhone: boolean,
  wasOpen: boolean,
  isOpen: boolean,
): boolean {
  return !isPhone && wasOpen && !isOpen;
}
