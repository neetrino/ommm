import type { ExploreTileMock } from "../../../../lib/mocks/homeMock";

export type ExploreSectionProps = {
  journalEyebrow: string;
  journalTitle: string;
  tiles: ExploreTileMock[];
};

export type ExploreTileColumnProps = {
  tile: ExploreTileMock;
  columnIndex: number;
  scale: number;
};

export type ExploreTileTagRowProps = {
  tile: ExploreTileMock;
  scale: number;
  badgeTop: number;
  retreatLeadingInset: number;
};
