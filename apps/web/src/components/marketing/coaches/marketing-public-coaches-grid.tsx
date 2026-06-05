"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { useCallback, useState } from "react";
import type { CoachCardData } from "@/components/coaches/coach-card-display";
import { CoachesPageCoachCard } from "@/components/marketing/coaches/coaches-page-coach-card";
import { COACHES_PAGE_CARD } from "@/components/marketing/coaches/coaches-page-tokens";
import gridStyles from "@/components/marketing/coaches/coaches-page-grid.module.css";
import { marketingRevealMotionProps } from "@/components/marketing/marketing-reveal-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type PublicCoach = CoachCardData;

type MarketingPublicCoachesGridProps = {
  coaches: PublicCoach[];
};

const GRID_STYLE = {
  "--coaches-page-grid-column-gap": `${COACHES_PAGE_CARD.gridColumnGapPx}px`,
  "--coaches-page-grid-row-gap": `${COACHES_PAGE_CARD.gridRowGapPx}px`,
} as CSSProperties;

export function MarketingPublicCoachesGrid({ coaches }: MarketingPublicCoachesGridProps) {
  const [expandedCoachId, setExpandedCoachId] = useState<string | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const toggleExpand = useCallback((coachId: string) => {
    setExpandedCoachId((current) => (current === coachId ? null : coachId));
  }, []);

  return (
    <ul className={gridStyles.grid} style={GRID_STYLE}>
      {coaches.map((coach, index) => (
        <motion.li
          key={coach.id}
          className={gridStyles.gridItem}
          {...marketingRevealMotionProps(index, reducedMotion)}
        >
          <div className={gridStyles.cardSlot}>
            <CoachesPageCoachCard
              user={coach.user}
              specialization={coach.specialization}
              bio={coach.bio}
              experienceYears={coach.experienceYears}
              imageIndex={index}
              expanded={expandedCoachId === coach.id}
              onToggleExpand={() => {
                toggleExpand(coach.id);
              }}
            />
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
