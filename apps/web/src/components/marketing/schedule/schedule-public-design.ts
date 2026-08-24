import styles from "@/components/marketing/schedule/schedule-public-design.module.css";

/** Schedule marketing page — luxury wellness tokens aligned with home weekly schedule. */
export const SCHEDULE_PAGE_BG = "relative overflow-hidden";
/** Legacy muted tokens — admin schedule day view still uses these. */
export const SCHEDULE_INK = "text-sage-800";
export const SCHEDULE_MUTED = "text-sage-500";
export const SCHEDULE_VIEW_SHELL = styles.viewShell;
export const SCHEDULE_SESSION_LIST = styles.sessionList;
export const SCHEDULE_SESSION_ROW = styles.sessionRow;
export const SCHEDULE_BOOK_BTN = styles.bookBtn;
export const SCHEDULE_BOOK_BTN_HOME = `${styles.bookBtn} ${styles.bookBtnHomeLayout}`;
export const SCHEDULE_CANCEL_BTN = styles.cancelBtn;
export const SCHEDULE_BOOKED_BTN = styles.bookedBtn;
export const SCHEDULE_BOOK_ACTION_GROUP = styles.bookActionGroup;

export const SCHEDULE_FILTER_TRIGGER = `${styles.filterTrigger} ommm-dropdown-trigger`;
export const SCHEDULE_FILTER_LABEL = styles.filterLabel;
export const SCHEDULE_FILTER_ROOT = styles.filterRoot;
export const SCHEDULE_FILTER_MENU = styles.filterMenu;

/** Minimum width for schedule filter floating menus (px). */
export const SCHEDULE_FILTER_MENU_MIN_WIDTH_PX = 320;
/** Maximum scrollable list height for schedule filter menus (px). */
export const SCHEDULE_FILTER_MENU_MAX_HEIGHT_PX = 280;

export const SCHEDULE_MONTH_FILTERS_ROW = styles.monthFiltersRow;
export const SCHEDULE_MONTH_FILTERS_CONTROLS = styles.monthFiltersControls;
export const SCHEDULE_MONTH_LABEL = styles.monthLabel;
export const SCHEDULE_DATE_STRIP_PANEL = styles.dateStripPanel;
export const SCHEDULE_WEEKDAY_LABEL = styles.weekdayLabel;
export const SCHEDULE_WEEKDAY_LABEL_ACTIVE = styles.weekdayLabelActive;
export const SCHEDULE_DATE_CHIP_ACTIVE = styles.dateChipActive;
export const SCHEDULE_DATE_CHIP_IDLE = styles.dateChipIdle;
export const SCHEDULE_DATE_CHIP_PAST = styles.dateChipPast;
export const SCHEDULE_DATE_CHIP_TODAY = styles.dateChipToday;
export const SCHEDULE_DATE_CHIP_SELECTED = styles.dateChipSelected;
export const SCHEDULE_ARROW_BTN = styles.arrowBtn;
export const SCHEDULE_SELECTED_DAY_DIVIDER = styles.selectedDayDivider;
export const SCHEDULE_SELECTED_DAY_LABEL = styles.selectedDayLabel;

export const SCHEDULE_TIME_LABEL = styles.timeLabel;
export const SCHEDULE_DURATION_LABEL = styles.durationLabel;
export const SCHEDULE_CLASS_TITLE = styles.classTitle;
export const SCHEDULE_CLASS_SUBTITLE = styles.classSubtitle;
export const SCHEDULE_SPOTS_LABEL = styles.spotsLabel;
export const SCHEDULE_SPOTS_LABEL_URGENT = styles.spotsLabelUrgent;

export const SCHEDULE_INTERACTIVE_LIFT =
  "transition-transform duration-300 ease-out hover:-translate-y-0.5 motion-reduce:transform-none";
