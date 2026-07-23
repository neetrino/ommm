export type ScheduleDayOfWeek =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

export type AdminScheduleItem = {
  id: string;
  className: string;
  instructorName: string;
  classType: string;
  dayOfWeek: ScheduleDayOfWeek;
  startTime: string;
  endTime: string | null;
  durationMinutes: number | null;
  availableSpots: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
