export type NextClassContent = {
  title: string;
  badge: string;
  timeLocation: string;
  instructor: string;
  durationLabel: string;
  spotsLabel: string;
  statusLabel: string;
};

export type NextClassSectionProps = {
  content: NextClassContent;
  onAllEventsPress?: () => void;
  onOpenClassPress?: () => void;
};
