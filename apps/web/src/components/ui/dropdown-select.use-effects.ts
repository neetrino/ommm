"use client";

import { useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import {
  HOVER_OPEN_MEDIA_QUERY,
  MOBILE_VIEWPORT_MEDIA_QUERY,
} from "@/components/ui/dropdown-select.constants";
import { prefersReducedMotion } from "@/components/ui/dropdown-select.helpers";

type UseDropdownSelectEffectsParams = {
  open: boolean;
  disabled: boolean;
  searchable: boolean;
  openOnHover: boolean;
  isMenuOpen: boolean;
  isMobileViewport: boolean;
  menuExitHold: boolean;
  menuMotionActive: boolean;
  safeFocusedIndex: number;
  rootRef: MutableRefObject<HTMLDivElement | null>;
  triggerRef: MutableRefObject<HTMLButtonElement | null>;
  menuRef: MutableRefObject<HTMLDivElement | null>;
  searchInputRef: MutableRefObject<HTMLInputElement | null>;
  optionRefs: MutableRefObject<Array<HTMLButtonElement | null>>;
  hoverCloseTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  scrollDismissRef: MutableRefObject<boolean>;
  setHoverOpenCapable: Dispatch<SetStateAction<boolean>>;
  setIsMobileViewport: Dispatch<SetStateAction<boolean>>;
  setMenuAnimatedIn: Dispatch<SetStateAction<boolean>>;
  dismissMenu: () => void;
};

export function useDropdownSelectEffects({
  open,
  disabled,
  searchable,
  openOnHover,
  isMenuOpen,
  isMobileViewport,
  menuExitHold,
  menuMotionActive,
  safeFocusedIndex,
  rootRef,
  menuRef,
  searchInputRef,
  optionRefs,
  hoverCloseTimerRef,
  scrollDismissRef,
  setHoverOpenCapable,
  setIsMobileViewport,
  setMenuAnimatedIn,
  dismissMenu,
}: UseDropdownSelectEffectsParams): void {
  useEffect(() => {
    if (!isMenuOpen || !searchable) {
      return;
    }
    const handle = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
    return () => {
      window.cancelAnimationFrame(handle);
    };
  }, [isMenuOpen, searchable, searchInputRef]);

  useEffect(() => {
    const hoverMediaQuery = window.matchMedia(HOVER_OPEN_MEDIA_QUERY);
    const mobileMediaQuery = window.matchMedia(MOBILE_VIEWPORT_MEDIA_QUERY);
    const syncPointerCapability = () => {
      setHoverOpenCapable(hoverMediaQuery.matches);
    };
    const syncMobileViewport = () => {
      setIsMobileViewport(mobileMediaQuery.matches);
    };

    syncPointerCapability();
    syncMobileViewport();
    hoverMediaQuery.addEventListener("change", syncPointerCapability);
    mobileMediaQuery.addEventListener("change", syncMobileViewport);

    return () => {
      hoverMediaQuery.removeEventListener("change", syncPointerCapability);
      mobileMediaQuery.removeEventListener("change", syncMobileViewport);
    };
  }, [setHoverOpenCapable, setIsMobileViewport]);

  useEffect(() => {
    if (!open || disabled) {
      return undefined;
    }
    const closeOnOutside = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }
      const clickedTrigger = rootRef.current?.contains(event.target) ?? false;
      const clickedMenu = menuRef.current?.contains(event.target) ?? false;
      if (!clickedTrigger && !clickedMenu) {
        dismissMenu();
      }
    };
    const listenerId = window.setTimeout(() => {
      document.addEventListener("click", closeOnOutside);
    }, 0);
    return () => {
      window.clearTimeout(listenerId);
      document.removeEventListener("click", closeOnOutside);
    };
  }, [disabled, dismissMenu, menuRef, open, rootRef]);

  useEffect(() => {
    if (!isMobileViewport || (!isMenuOpen && !menuExitHold)) {
      return undefined;
    }

    document.body.dataset.ommmDropdownOpen = "true";
    return () => {
      delete document.body.dataset.ommmDropdownOpen;
    };
  }, [isMenuOpen, isMobileViewport, menuExitHold]);

  useEffect(() => {
    if (!open || disabled || !isMobileViewport) {
      return undefined;
    }

    const closeOnPageScroll = (event: Event) => {
      if (scrollDismissRef.current) {
        return;
      }
      if (event.target instanceof Node && menuRef.current?.contains(event.target)) {
        return;
      }
      if (
        event.target instanceof Element &&
        event.target.closest("#integrated-search-filter-panel")
      ) {
        return;
      }
      scrollDismissRef.current = true;
      dismissMenu();
    };

    window.addEventListener("scroll", closeOnPageScroll, true);
    return () => {
      window.removeEventListener("scroll", closeOnPageScroll, true);
    };
  }, [disabled, dismissMenu, isMobileViewport, menuRef, open, scrollDismissRef]);

  useEffect(() => {
    if (!isMenuOpen || openOnHover) {
      return;
    }
    optionRefs.current[safeFocusedIndex]?.focus();
  }, [isMenuOpen, openOnHover, optionRefs, safeFocusedIndex]);

  useEffect(() => {
    return () => {
      if (hoverCloseTimerRef.current !== null) {
        clearTimeout(hoverCloseTimerRef.current);
      }
    };
  }, [hoverCloseTimerRef]);

  useEffect(() => {
    if (!menuMotionActive) {
      return undefined;
    }

    if (!isMenuOpen) {
      const exitId = window.requestAnimationFrame(() => {
        setMenuAnimatedIn(false);
      });
      return () => window.cancelAnimationFrame(exitId);
    }

    if (prefersReducedMotion()) {
      const enterId = window.requestAnimationFrame(() => {
        setMenuAnimatedIn(true);
      });
      return () => window.cancelAnimationFrame(enterId);
    }

    const enterId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setMenuAnimatedIn(true));
    });
    return () => window.cancelAnimationFrame(enterId);
  }, [isMenuOpen, menuMotionActive, setMenuAnimatedIn]);
}
