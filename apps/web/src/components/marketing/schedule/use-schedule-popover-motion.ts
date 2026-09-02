"use client";

import { useCallback, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type SchedulePopoverMotion = {
  open: boolean;
  mounted: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  onExitComplete: () => void;
};

/** Open/close hold for schedule popovers — matches filter dropdown dismiss motion. */
export function useSchedulePopoverMotion(): SchedulePopoverMotion {
  const reducedMotion = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const show = useCallback(() => {
    setMounted(true);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    setOpen(false);
    if (reducedMotion) {
      setMounted(false);
    }
  }, [reducedMotion]);

  const toggle = useCallback(() => {
    setOpen((current) => {
      if (current) {
        if (reducedMotion) {
          setMounted(false);
        }
        return false;
      }
      setMounted(true);
      return true;
    });
  }, [reducedMotion]);

  const onExitComplete = useCallback(() => {
    setMounted(false);
  }, []);

  return { open, mounted, show, hide, toggle, onExitComplete };
}
