"use client";

export type AdminPillTabItem = {
  id: string;
  label: string;
};

type AdminPillTabsProps = {
  items: readonly AdminPillTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  ariaLabel: string;
};

/**
 * Horizontal pill tab row — matches Figma admin category filters.
 */
export function AdminPillTabs({ items, activeId, onChange, ariaLabel }: AdminPillTabsProps) {
  return (
    <div
      className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={
              active
                ? "ommm-admin-pill-tab ommm-admin-pill-tab-active shrink-0"
                : "ommm-admin-pill-tab shrink-0"
            }
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
