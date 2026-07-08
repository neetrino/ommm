import type { PackagesPageAccordionCategory } from "@/components/marketing/packages/packages-page-category-data";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

export type PackagesPageAccordionProps = {
  locale: string;
  categories: readonly PackagesPageAccordionCategory[];
  desktopCardsPerRow?: number;
};

export type DesktopPanelMode = "idle" | "collapsed" | "expanded";

export type ExpandedTierTableProps = {
  locale: string;
  category: PackagesPageAccordionCategory;
  audience: PublicPackageCategoryCardsAudience;
  selectedPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  onSubscribe: (plan: PublicPackagePlan) => void;
};

export type ExpandedTierRowProps = {
  locale: string;
  plan: PublicPackagePlan;
  audience: PublicPackageCategoryCardsAudience;
  isSelected: boolean;
  isMixExpanded: boolean;
  onSelectPlan: (planId: string) => void;
  onSubscribe: (plan: PublicPackagePlan) => void;
  onToggleMixExpand: () => void;
};

export type DesktopAccordionPanelProps = {
  locale: string;
  category: PackagesPageAccordionCategory;
  mode: DesktopPanelMode;
  detailsLabel: string;
  openLabel: string;
  closeLabel: string;
  audience: PublicPackageCategoryCardsAudience;
  selectedPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  onSubscribe: (plan: PublicPackagePlan) => void;
  onOpen: (categoryId: string) => void;
  onClose: () => void;
};

export type MobileAccordionSlotProps = {
  locale: string;
  category: PackagesPageAccordionCategory;
  isExpanded: boolean;
  detailsLabel: string;
  onOpen: (categoryId: string) => void;
  onClose: () => void;
  openLabel: string;
  closeLabel: string;
  audience: PublicPackageCategoryCardsAudience;
  selectedPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  onSubscribe: (plan: PublicPackagePlan) => void;
};

export type DesktopAccordionSlotProps = {
  locale: string;
  category: PackagesPageAccordionCategory;
  expandedCategory: PackagesPageAccordionCategory | null;
  detailsLabel: string;
  onOpen: (categoryId: string) => void;
  onClose: () => void;
  openLabel: string;
  closeLabel: string;
  audience: PublicPackageCategoryCardsAudience;
  selectedPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  onSubscribe: (plan: PublicPackagePlan) => void;
};

export type DesktopAccordionRowProps = {
  locale: string;
  row: readonly PackagesPageAccordionCategory[];
  rowIndex: number;
  expandedCategory: PackagesPageAccordionCategory | null;
  cardsPerRow: number;
  detailsLabel: string;
  resolveOpenLabel: (categoryName: string) => string;
  resolveCloseLabel: (categoryName: string) => string;
  audience: PublicPackageCategoryCardsAudience;
  selectedPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  onSubscribe: (plan: PublicPackagePlan) => void;
  onOpen: (categoryId: string) => void;
  onClose: () => void;
};

export type PackagesSubscribeModalHostProps = {
  locale: string;
  categories: readonly PackagesPageAccordionCategory[];
  audience: PublicPackageCategoryCardsAudience;
};
