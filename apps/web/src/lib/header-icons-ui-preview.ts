/**
 * TEMP UI preview only — fake header badge/list samples.
 * Set to `false` before shipping. Does not write to the API or database.
 */
export const HEADER_ICONS_UI_PREVIEW = true;

const PREVIEW_NOW = "2026-08-25T12:00:00.000Z";
const PREVIEW_SESSION_START = "2026-08-26T09:00:00.000Z";
const PREVIEW_SESSION_END = "2026-08-26T10:00:00.000Z";

export type HeaderPreviewStaffActivity = {
  id: string;
  type: "BOOKING_CREATED" | "BOOKING_CANCELLED";
  bookingId: string | null;
  memberName: string;
  className: string;
  sessionStartsAt: string;
  createdAt: string;
  isUnread: boolean;
};

export type HeaderPreviewCallTask = {
  id: string;
  contactName: string;
  phone: string;
  comment: string;
  dueOn: string;
  dueOnDate: string;
  status: "PENDING" | "DONE" | "CANCELLED";
  userId: string | null;
  createdById: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
  isDueToday: boolean;
};

export type HeaderPreviewStaffReview = {
  id: string;
  classTypeName: string;
  sessionTitle: string;
  startsAt: string;
  endsAt: string;
  coachName: string;
  rating: number;
  comment: string | null;
  isAnonymous: boolean;
  author: { id: string; displayName: string } | null;
  submittedAt: string;
  staffReadAt: string | null;
};

export const HEADER_PREVIEW_STAFF_ACTIVITY: HeaderPreviewStaffActivity[] = [
  {
    id: "preview-activity-1",
    type: "BOOKING_CREATED",
    bookingId: null,
    memberName: "Anna Petrosyan",
    className: "Morning Yoga",
    sessionStartsAt: PREVIEW_SESSION_START,
    createdAt: PREVIEW_NOW,
    isUnread: true,
  },
  {
    id: "preview-activity-2",
    type: "BOOKING_CANCELLED",
    bookingId: null,
    memberName: "David Hakobyan",
    className: "Pilates Reformer",
    sessionStartsAt: PREVIEW_SESSION_START,
    createdAt: "2026-08-25T11:40:00.000Z",
    isUnread: true,
  },
  {
    id: "preview-activity-3",
    type: "BOOKING_CREATED",
    bookingId: null,
    memberName: "Lilit Sargsyan",
    className: "Sound Bath",
    sessionStartsAt: PREVIEW_SESSION_START,
    createdAt: "2026-08-25T11:10:00.000Z",
    isUnread: true,
  },
  {
    id: "preview-activity-4",
    type: "BOOKING_CANCELLED",
    bookingId: null,
    memberName: "Gor Avetisyan",
    className: "Hot Yoga",
    sessionStartsAt: PREVIEW_SESSION_START,
    createdAt: "2026-08-25T10:55:00.000Z",
    isUnread: true,
  },
  {
    id: "preview-activity-5",
    type: "BOOKING_CREATED",
    bookingId: null,
    memberName: "Mariam Karapetyan",
    className: "Vinyasa Flow",
    sessionStartsAt: PREVIEW_SESSION_START,
    createdAt: "2026-08-25T10:20:00.000Z",
    isUnread: true,
  },
];

export const HEADER_PREVIEW_STAFF_ACTIVITY_UNREAD =
  HEADER_PREVIEW_STAFF_ACTIVITY.length;

export const HEADER_PREVIEW_CALL_TASKS: HeaderPreviewCallTask[] = [
  {
    id: "preview-call-1",
    contactName: "Nare Grigoryan",
    phone: "+374 91 000 111",
    comment: "Asked about package renewal — call back today.",
    dueOn: PREVIEW_NOW,
    dueOnDate: "2026-08-25",
    status: "PENDING",
    userId: null,
    createdById: "preview",
    completedAt: null,
    createdAt: PREVIEW_NOW,
    updatedAt: PREVIEW_NOW,
    isOverdue: false,
    isDueToday: true,
  },
  {
    id: "preview-call-2",
    contactName: "Arman Mkrtchyan",
    phone: "+374 99 222 333",
    comment: "Missed trial class follow-up.",
    dueOn: PREVIEW_NOW,
    dueOnDate: "2026-08-24",
    status: "PENDING",
    userId: null,
    createdById: "preview",
    completedAt: null,
    createdAt: PREVIEW_NOW,
    updatedAt: PREVIEW_NOW,
    isOverdue: true,
    isDueToday: false,
  },
  {
    id: "preview-call-3",
    contactName: "Sona Danielyan",
    phone: "+374 77 444 555",
    comment: "Wants to switch to evening class.",
    dueOn: PREVIEW_NOW,
    dueOnDate: "2026-08-25",
    status: "PENDING",
    userId: null,
    createdById: "preview",
    completedAt: null,
    createdAt: PREVIEW_NOW,
    updatedAt: PREVIEW_NOW,
    isOverdue: false,
    isDueToday: true,
  },
  {
    id: "preview-call-4",
    contactName: "Lilit Hakobyan",
    phone: "+374 55 666 777",
    comment: "Gift card balance question.",
    dueOn: PREVIEW_NOW,
    dueOnDate: "2026-08-26",
    status: "PENDING",
    userId: null,
    createdById: "preview",
    completedAt: null,
    createdAt: PREVIEW_NOW,
    updatedAt: PREVIEW_NOW,
    isOverdue: false,
    isDueToday: false,
  },
  {
    id: "preview-call-5",
    contactName: "David Petrosyan",
    phone: "+374 93 888 999",
    comment: "Confirmed booking for Saturday — no further action.",
    dueOn: PREVIEW_NOW,
    dueOnDate: "2026-08-23",
    status: "DONE",
    userId: null,
    createdById: "preview",
    completedAt: PREVIEW_NOW,
    createdAt: PREVIEW_NOW,
    updatedAt: PREVIEW_NOW,
    isOverdue: false,
    isDueToday: false,
  },
  {
    id: "preview-call-6",
    contactName: "Ani Karapetyan",
    phone: "+374 98 111 222",
    comment: "Duplicate task — cancelled.",
    dueOn: PREVIEW_NOW,
    dueOnDate: "2026-08-22",
    status: "CANCELLED",
    userId: null,
    createdById: "preview",
    completedAt: null,
    createdAt: PREVIEW_NOW,
    updatedAt: PREVIEW_NOW,
    isOverdue: false,
    isDueToday: false,
  },
];

export const HEADER_PREVIEW_STAFF_REVIEWS: HeaderPreviewStaffReview[] = [
  {
    id: "preview-review-1",
    classTypeName: "Vinyasa Flow",
    sessionTitle: "Evening Flow",
    startsAt: PREVIEW_SESSION_START,
    endsAt: PREVIEW_SESSION_END,
    coachName: "Sona",
    rating: 5,
    comment: "Calm cues and great playlist.",
    isAnonymous: false,
    author: { id: "preview-user-1", displayName: "Mariam A." },
    submittedAt: PREVIEW_NOW,
    staffReadAt: null,
  },
  {
    id: "preview-review-2",
    classTypeName: "Hot Yoga",
    sessionTitle: "Midday Heat",
    startsAt: PREVIEW_SESSION_START,
    endsAt: PREVIEW_SESSION_END,
    coachName: "Aram",
    rating: 4,
    comment: null,
    isAnonymous: true,
    author: null,
    submittedAt: PREVIEW_NOW,
    staffReadAt: null,
  },
  {
    id: "preview-review-3",
    classTypeName: "Pilates",
    sessionTitle: "Core Strength",
    startsAt: PREVIEW_SESSION_START,
    endsAt: PREVIEW_SESSION_END,
    coachName: "Lilit",
    rating: 5,
    comment: "Perfect pace for beginners.",
    isAnonymous: false,
    author: { id: "preview-user-2", displayName: "Ani K." },
    submittedAt: PREVIEW_NOW,
    staffReadAt: null,
  },
];

export const HEADER_PREVIEW_STAFF_REVIEWS_UNREAD =
  HEADER_PREVIEW_STAFF_REVIEWS.length;
