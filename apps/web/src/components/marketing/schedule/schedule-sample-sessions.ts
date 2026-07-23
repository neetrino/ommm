export type ScheduleSampleSlug =
  | "compression"
  | "lagree"
  | "restorative"
  | "vinYasa"
  | "meditation";

export type ScheduleClassTypeFilter = "all" | "mat" | "reformer" | "therapy";

export type ScheduleInstructorFilter = "all" | "elena" | "alex" | "frontDesk";

export type ScheduleSampleSessionDef = {
  readonly id: string;
  /** Calendar day offset from the client baseline (local midnight “today” at first mount). */
  readonly dayOffset: number;
  readonly startHour: number;
  readonly startMinute: number;
  readonly durationMinutes: number;
  readonly sampleSlug: ScheduleSampleSlug;
  readonly classType: ScheduleClassTypeFilter;
  readonly instructorKey: ScheduleInstructorFilter;
};

export const SCHEDULE_SAMPLE_SESSION_DEFS: readonly ScheduleSampleSessionDef[] = [
  {
    id: "s1",
    dayOffset: 0,
    startHour: 16,
    startMinute: 15,
    durationMinutes: 45,
    sampleSlug: "compression",
    classType: "therapy",
    instructorKey: "frontDesk",
  },
  {
    id: "s2",
    dayOffset: 0,
    startHour: 17,
    startMinute: 30,
    durationMinutes: 50,
    sampleSlug: "lagree",
    classType: "reformer",
    instructorKey: "elena",
  },
  {
    id: "s3",
    dayOffset: 0,
    startHour: 19,
    startMinute: 0,
    durationMinutes: 60,
    sampleSlug: "restorative",
    classType: "mat",
    instructorKey: "alex",
  },
  {
    id: "s4",
    dayOffset: 1,
    startHour: 7,
    startMinute: 30,
    durationMinutes: 60,
    sampleSlug: "vinYasa",
    classType: "mat",
    instructorKey: "elena",
  },
  {
    id: "s5",
    dayOffset: 1,
    startHour: 12,
    startMinute: 15,
    durationMinutes: 45,
    sampleSlug: "meditation",
    classType: "mat",
    instructorKey: "alex",
  },
];
