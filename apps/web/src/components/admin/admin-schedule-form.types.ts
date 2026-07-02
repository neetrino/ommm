import type {
  AdminScheduleItem,
  ScheduleDayOfWeek,
} from "@/components/admin/admin-schedule-types";

export const ADMIN_SCHEDULE_FORM_MAX_CLASS_NAME_LENGTH = 120;
export const ADMIN_SCHEDULE_FORM_MAX_INSTRUCTOR_LENGTH = 120;
export const ADMIN_SCHEDULE_FORM_MAX_CLASS_TYPE_LENGTH = 80;
export const ADMIN_SCHEDULE_FORM_MAX_TYPE_SLUG_LENGTH = 120;
export const ADMIN_SCHEDULE_FORM_MAX_DESCRIPTION_LENGTH = 1000;
export const ADMIN_SCHEDULE_FORM_MIN_SPOTS = 1;
export const ADMIN_SCHEDULE_FORM_MIN_DURATION = 1;

export type AdminScheduleMutationPayload = {
  className: string;
  instructorName: string;
  classType: string;
  dayOfWeek: ScheduleDayOfWeek;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  availableSpots: number;
  description?: string;
  isActive: boolean;
};

export type AdminScheduleFormState = {
  className: string;
  instructorName: string;
  classType: string;
  dayOfWeek: ScheduleDayOfWeek;
  startTime: string;
  endTime: string;
  durationMinutes: string;
  availableSpots: string;
  description: string;
  isActive: boolean;
};

export type AdminScheduleFormProps = {
  mode: "create" | "edit";
  classTypeOptions: readonly string[];
  item?: AdminScheduleItem;
  onSaved: () => void;
  onCancel: () => void;
};

export type AdminScheduleClassTypeCreateResponse = {
  id: string;
  name: string;
  slug: string;
};
