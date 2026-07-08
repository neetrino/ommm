/** Vertical space below safe-area top so scroll content clears the absolute AppHeader overlay. */
export const APP_HEADER_CONTENT_CLEARANCE = 90;

/** ScrollView `paddingTop` when AppHeader is shown as an absolute overlay. */
export function appHeaderScrollPaddingTop(insetsTop: number): number {
  return insetsTop + APP_HEADER_CONTENT_CLEARANCE;
}
