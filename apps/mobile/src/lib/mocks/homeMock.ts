/**
 * Shared home feed types for member home UI.
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
  /** Square tiles use fixed corner radius; `roundedPortrait` for taller frames. */
  imageLayout: "square" | "roundedPortrait";
};
