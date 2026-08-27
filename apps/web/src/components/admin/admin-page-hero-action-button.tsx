import type { ReactNode } from "react";
import { OmmButton, type OmmButtonProps } from "@/components/ui/omm-button";

/** Full-width pill on phone; inline beside search from `sm` up (matches schedule). */
export const ADMIN_PAGE_HERO_PRIMARY_ACTION_BUTTON_CLASS =
  "inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full sm:w-auto";

type AdminPageHeroActionButtonProps = Omit<OmmButtonProps, "variant" | "size"> & {
  children: ReactNode;
};

export function AdminPageHeroActionButton({
  className,
  children,
  ...rest
}: AdminPageHeroActionButtonProps) {
  return (
    <OmmButton
      variant="secondary"
      size="md"
      className={[ADMIN_PAGE_HERO_PRIMARY_ACTION_BUTTON_CLASS, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </OmmButton>
  );
}
