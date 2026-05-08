/**
 * Static home content until dedicated booking/waitlist APIs exist.
 * UI imports this module only — never inline mock literals in components.
 */
export type WaitlistItem = {
  id: string;
  spotLabel: string;
  title: string;
  scheduleLabel: string;
  variant: "light" | "dark";
};

export type ExploreTileMock = {
  id: string;
  tag: string;
  title: string;
  imageUriKey: "exploreRetreat" | "explorePilates";
  tagVariant: "light" | "dark";
};

export const homeMock = {
  user: {
    firstName: "Anna",
  },
  nextClass: {
    title: "Morning Flow",
    badge: "COMING UP NEXT",
    timeLocation: "Today, 6:30 PM · Studio A",
    instructor: "with Elena Petrosyan",
    durationLabel: "45 min",
    spotsLabel: "12 spots available",
    statusLabel: "Confirmed",
  },
  waitlist: [
    {
      id: "w1",
      spotLabel: "#2 SPOT",
      title: "Deep Stretch",
      scheduleLabel: "Thu, 19:00",
      variant: "light",
    },
    {
      id: "w2",
      spotLabel: "#5 SPOT",
      title: "Reformer",
      scheduleLabel: "Sat, 10:00",
      variant: "dark",
    },
  ] satisfies WaitlistItem[],
  explore: {
    journalEyebrow: "WELLNESS JOURNAL",
    journalTitle: "The Power of Breath",
    tiles: [
      {
        id: "e1",
        tag: "RETREAT",
        title: "Spring in Tuscany",
        imageUriKey: "exploreRetreat",
        tagVariant: "light",
      },
      {
        id: "e2",
        tag: "PILATES",
        title: "Enhanced Protocols",
        imageUriKey: "explorePilates",
        tagVariant: "dark",
      },
    ] satisfies ExploreTileMock[],
  },
  giftCard: {
    titleLead: "Share ",
    titleAccent: "Calm.",
    subtitleLines: [
      "The perfect gift for someone you",
      "truly love.",
    ] as const,
    ctaLabel: "Buy a gift card",
  },
} as const;
