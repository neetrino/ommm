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
  instructorAvatarUrl?: string | null;
  instructorBio?: string | null;
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
  /** Package-category description matched by class type (from packages admin). */
  categoryDescription?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
