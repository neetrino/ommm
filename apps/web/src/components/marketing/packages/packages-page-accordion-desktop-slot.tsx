import accordionStyles from "@/components/marketing/packages/packages-page-accordion.module.css";
import { resolveDesktopPanelMode } from "@/components/marketing/packages/packages-page-accordion.helpers";
import type { DesktopAccordionSlotProps } from "@/components/marketing/packages/packages-page-accordion.types";
import { PackagesPageAccordionDesktopPanel } from "@/components/marketing/packages/packages-page-accordion-desktop-panel";

export function PackagesPageAccordionDesktopSlot({
  locale,
  category,
  expandedCategory,
  detailsLabel,
  onOpen,
  onClose,
  openLabel,
  closeLabel,
  audience,
  selectedPlanId,
  onSelectPlan,
  onSubscribe,
}: DesktopAccordionSlotProps) {
  const isAccordionMode = expandedCategory !== null;
  const isExpanded = expandedCategory?.id === category.id;
  const mode = resolveDesktopPanelMode(isAccordionMode, isExpanded);

  return (
    <div className={accordionStyles.slotContent}>
      <PackagesPageAccordionDesktopPanel
        locale={locale}
        category={category}
        mode={mode}
        detailsLabel={detailsLabel}
        openLabel={openLabel}
        closeLabel={closeLabel}
        audience={audience}
        selectedPlanId={selectedPlanId}
        onSelectPlan={onSelectPlan}
        onSubscribe={onSubscribe}
        onOpen={onOpen}
        onClose={onClose}
      />
    </div>
  );
}
