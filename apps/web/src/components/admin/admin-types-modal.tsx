"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import {
  AdminTypesManagement,
  type AdminClassTypeRow,
} from "@/components/admin/admin-types-management";
import { adminChrome } from "@/components/admin/admin-chrome";
import { OmmModalPortal } from "@/components/ui/omm-modal";

type AdminTypesModalProps = {
  isOpen: boolean;
  initialTypes: readonly AdminClassTypeRow[];
  onClose: () => void;
  onTypesChanged?: (types: readonly AdminClassTypeRow[]) => void;
};

const TYPES_MODAL_PANEL_CLASS =
  "mt-auto flex max-h-[92vh] w-full max-w-[min(960px,95vw)] flex-col overflow-hidden rounded-t-[28px] border border-white/60 bg-white/85 shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)] backdrop-blur-md sm:mt-0 sm:rounded-[28px]";

export function AdminTypesModal({
  isOpen,
  initialTypes,
  onClose,
  onTypesChanged,
}: AdminTypesModalProps) {
  const tTypes = useTranslations("adminPages.classes.classTypes");
  const tPackages = useTranslations("adminPages.packages");
  const titleId = useId();

  if (!isOpen) {
    return null;
  }

  return (
    <OmmModalPortal
      isOpen={isOpen}
      onClose={onClose}
      backdropAriaLabel={tTypes("modalBackdropClose")}
      overlayClassName="ommm-modal-overlay z-[110]"
      panelClassName={TYPES_MODAL_PANEL_CLASS}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-white/60 bg-white/55 px-5 py-4 sm:px-7 sm:py-5">
          <h2 id={titleId} className={adminChrome.panelHeading}>
            {tTypes("modalTitle")}
          </h2>
          <button
            type="button"
            className="shrink-0 rounded-full p-2 text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            aria-label={tPackages("modalCloseAria")}
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              className="h-5 w-5"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-7 sm:py-5">
          <AdminTypesManagement
            initialTypes={initialTypes}
            embedded
            onTypesChanged={onTypesChanged}
          />
        </div>
      </div>
    </OmmModalPortal>
  );
}
