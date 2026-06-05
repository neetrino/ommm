export type MarketingScheduleDayOfWeek =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

export type MarketingScheduleItem = {
  id: string;
  className: string;
  instructorName: string;
  classType: string;
  dayOfWeek: MarketingScheduleDayOfWeek;
  startTime: string;
  endTime: string | null;
  durationMinutes: number | null;
  availableSpots: number;
  level: string | null;
  status: "ACTIVE" | "FULL" | string;
  sessionDate: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
