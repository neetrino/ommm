import { routing } from "@/i18n/routing";

/**
 * Public schedule surfaces (Home weekly schedule + `/schedule`) always use English
 * copy and date labels, regardless of the active UI locale.
 */
export const SCHEDULE_UI_LOCALE = routing.defaultLocale;
