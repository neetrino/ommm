export type BroadcastAudience = "users" | "coaches" | "staff" | "all";

export type ScheduledBroadcastStatus = "PENDING" | "SENT" | "FAILED" | "CANCELLED";

export type NotificationStats = {
  immediateBroadcasts: number;
  scheduledBroadcasts: number;
  scheduledPending: number;
  scheduledSent: number;
  scheduledFailed: number;
  reminderDeliveries: number;
  scheduledCancelled: number;
  byAudience: {
    users: number;
    coaches: number;
    staff: number;
    all: number;
  };
};

export type ScheduledBroadcast = {
  id: string;
  subject: string;
  html: string;
  audience: BroadcastAudience;
  onlyPromotionsOptIn: boolean;
  scheduleAt: string;
  status: ScheduledBroadcastStatus;
  createdAt: string;
  updatedAt: string;
};

export type DeliveryRow = {
  id: string;
  createdAt: string;
  recipientEmail: string;
  channel: string;
  audience: BroadcastAudience;
  subject: string;
  scheduled: boolean;
};

export type NotificationAnalytics = {
  summary: {
    campaignsTotal: number;
    deliveriesTotal: number;
    averageRecipientsPerCampaign: number;
  };
  funnel: {
    deliveryRatePct: number;
    scheduledCampaigns: number;
    immediateCampaigns: number;
  };
  channelBreakdown: Array<{ channel: string; deliveries: number }>;
};

export type AdminNotificationsPayload = {
  stats: NotificationStats;
  scheduled: ScheduledBroadcast[];
  deliveries: DeliveryRow[];
  analytics: NotificationAnalytics;
  loadErrors: {
    stats: boolean;
    scheduled: boolean;
    deliveries: boolean;
    analytics: boolean;
  };
};
