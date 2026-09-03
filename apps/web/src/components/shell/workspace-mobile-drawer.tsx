"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { DashboardSidebarNav } from "@/components/shell/dashboard-sidebar-nav";
import type { DashboardShellVariant } from "@/components/shell/dashboard-shell-types";
import {
  avatarRingClass,
  brandInitial,
  mobileDrawerBrandSublineClass,
  mobileDrawerBrandTitleClass,
  mobileDrawerCloseButtonClass,
  mobileDrawerFooterClass,
  mobileDrawerHeaderBorderClass,
  mobileDrawerOverlayScrimClass,
  mobileDrawerPanelClass,
} from "@/components/shell/dashboard-shell-classes";
import { isOliveDashboardShell } from "@/components/shell/dashboard-shell-variant-utils";
import {
  WORKSPACE_MOBILE_DRAWER_MOTION_MS,
  workspaceMobileDrawerLayout,
} from "@/components/shell/workspace-mobile-drawer-layout";
import type { DashboardNavItem } from "@/lib/dashboard-nav";
import { useCloseOnEscape } from "@/hooks/use-close-on-escape";

type WorkspaceMobileDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: DashboardShellVariant;
  withSiteHeader: boolean;
  brandLabel: string;
  brandSubline?: string;
  navItems: DashboardNavItem[];
  pathname: string;
  trailing?: ReactNode;
};

export function WorkspaceMobileDrawer({
  open,
  onOpenChange,
  variant,
  withSiteHeader,
  brandLabel,
  brandSubline,
  navItems,
  pathname,
  trailing,
}: WorkspaceMobileDrawerProps) {
  const tShell = useTranslations("dashboard.shell");
  const isOliveShell = isOliveDashboardShell(variant);
  const closingRef = useRef(false);
  const [isRendered, setIsRendered] = useState(open);
  const [isClosing, setIsClosing] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [scrimVisible, setScrimVisible] = useState(false);

  const requestClose = useCallback(() => {
    if (closingRef.current || !open) {
      return;
    }
    closingRef.current = true;
    setIsClosing(true);
    setPanelVisible(false);
    setScrimVisible(false);
    window.setTimeout(() => {
      closingRef.current = false;
      setIsClosing(false);
      setIsRendered(false);
      onOpenChange(false);
    }, WORKSPACE_MOBILE_DRAWER_MOTION_MS);
  }, [onOpenChange, open]);

  if (open && !isRendered) {
    setIsRendered(true);
  }
  if (open && isClosing) {
    setIsClosing(false);
  }

  useEffect(() => {
    if (open) {
      closingRef.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!isRendered || !open) {
      return undefined;
    }

    let enterFrame: number | undefined;
    const resetFrame = window.requestAnimationFrame(() => {
      setPanelVisible(false);
      setScrimVisible(false);
      enterFrame = window.requestAnimationFrame(() => {
        setPanelVisible(true);
        setScrimVisible(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(resetFrame);
      if (enterFrame !== undefined) {
        window.cancelAnimationFrame(enterFrame);
      }
    };
  }, [isRendered, open]);

  useEffect(() => {
    if (open || !isRendered || closingRef.current) {
      return undefined;
    }

    setPanelVisible(false);
    setScrimVisible(false);
    const timer = window.setTimeout(() => {
      setIsRendered(false);
    }, WORKSPACE_MOBILE_DRAWER_MOTION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open, isRendered]);

  useEffect(() => {
    if (!isRendered) {
      return undefined;
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isRendered]);

  useCloseOnEscape(isRendered && open, requestClose, {
    disabled: isClosing,
  });

  if (!isRendered) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 ${workspaceMobileDrawerLayout.overlayMobileOnly} ${withSiteHeader ? "z-[60]" : "z-40"}`}
      id="dashboard-mobile-drawer"
      role="dialog"
      aria-modal="true"
      aria-label={tShell("navigationDialogAria")}
    >
      <button
        type="button"
        className={[
          mobileDrawerOverlayScrimClass(variant),
          workspaceMobileDrawerLayout.drawerScrim,
          scrimVisible ? workspaceMobileDrawerLayout.drawerScrimVisible : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={tShell("closeMenuOverlay")}
        onClick={requestClose}
      />
      <div
        className={[
          mobileDrawerPanelClass(variant),
          workspaceMobileDrawerLayout.drawerPanel,
          panelVisible ? workspaceMobileDrawerLayout.drawerPanelVisible : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={`flex shrink-0 items-center justify-between gap-3 px-6 py-6 ${mobileDrawerHeaderBorderClass(variant)}`}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {!isOliveShell ? (
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${avatarRingClass(variant)}`}
              >
                {brandInitial(brandLabel)}
              </span>
            ) : null}
            <div className="min-w-0">
              <span className={mobileDrawerBrandTitleClass(variant)}>{brandLabel}</span>
              {brandSubline ? (
                <span className={mobileDrawerBrandSublineClass(variant)}>{brandSubline}</span>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            className={mobileDrawerCloseButtonClass(variant)}
            aria-label={tShell("closeMenu")}
            onClick={requestClose}
          >
            <svg
              className="h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <DashboardSidebarNav
            items={navItems}
            variant={variant}
            pathname={pathname}
            collapsed={false}
            onNavigate={requestClose}
          />
        </div>
        {trailing ? (
          <div className={mobileDrawerFooterClass(variant)}>{trailing}</div>
        ) : null}
      </div>
    </div>
  );
}
