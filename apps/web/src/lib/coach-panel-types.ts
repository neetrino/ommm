/** Coach dashboard API row shapes (web panel). */

import type {
  ScheduleSessionListRow,
  ScheduleSessionListStatus,
} from "@/components/shared/schedule/schedule-session-list-types";

export type CoachPanelSessionStatus = ScheduleSessionListStatus;

export type CoachPanelSessionRow = ScheduleSessionListRow;

export type CoachPanelBookingRow = {
  id: string;
  status: string;
  user: { name: string | null; email: string };
  session: {
    id: string;
    startsAt: string;
    endsAt: string;
    coachId: string;
    classType: { name: string };
  };
};
