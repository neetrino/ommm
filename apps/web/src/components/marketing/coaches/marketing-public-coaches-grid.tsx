"use client";

import type { CSSProperties } from "react";
import { useCallback, useRef, useState } from "react";
import type { CoachCardData } from "@/components/coaches/coach-card-display";
import { CoachesPageCoachCard } from "@/components/marketing/coaches/coaches-page-coach-card";
import { CoachesPageReveal } from "@/components/marketing/coaches/coaches-page-reveal";
import {
  CoachesPageCardHeightProvider,
  useCoachesPageGridCardHeight,
} from "@/components/marketing/coaches/coaches-page-card-height-context";
import { COACHES_PAGE_CARD } from "@/components/marketing/coaches/coaches-page-tokens";
import gridStyles from "@/components/marketing/coaches/coaches-page-grid.module.css";

type PublicCoach = CoachCardData;

type MarketingPublicCoachesGridProps = {
  coaches: PublicCoach[];
};

const GRID_STYLE = {
  "--coaches-page-grid-column-gap": `${COACHES_PAGE_CARD.gridColumnGapPx}px`,
  "--coaches-page-grid-row-gap": `${COACHES_PAGE_CARD.gridRowGapPx}px`,
} as CSSProperties;

export function MarketingPublicCoachesGrid({ coaches }: MarketingPublicCoachesGridProps) {
  const gridRef = useRef<HTMLUListElement>(null);
  const cardHeightPx = useCoachesPageGridCardHeight(gridRef);
  const [expandedCoachId, setExpandedCoachId] = useState<string | null>(null);

  const toggleExpand = useCallback((coachId: string) => {
    setExpandedCoachId((current) => (current === coachId ? null : coachId));
  }, []);

  return (
    <CoachesPageCardHeightProvider heightPx={cardHeightPx}>
      <ul ref={gridRef} className={gridStyles.grid} style={GRID_STYLE}>
        {coaches.map((coach, index) => (
          <li key={coach.id} className={gridStyles.gridItem}>
            <CoachesPageReveal index={index}>
              <div className={gridStyles.cardSlot}>
                <CoachesPageCoachCard
                  user={coach.user}
                  specialization={coach.specialization}
                  bio={coach.bio}
                  experienceYears={coach.experienceYears}
                  expanded={expandedCoachId === coach.id}
                  onToggleExpand={() => {
                    toggleExpand(coach.id);
                  }}
                />
              </div>
            </CoachesPageReveal>
          </li>
        ))}
      </ul>
    </CoachesPageCardHeightProvider>
  );
}
