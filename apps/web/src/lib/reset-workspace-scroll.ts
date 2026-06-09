const WORKSPACE_SCROLL_PANE_SELECTOR = "[data-workspace-scroll-pane]";

/** Scroll window and the workspace shell pane to top (member mobile uses window scroll). */
export function resetWorkspaceScrollPosition(): void {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const pane = document.querySelector<HTMLElement>(WORKSPACE_SCROLL_PANE_SELECTOR);
  if (pane) {
    pane.scrollTop = 0;
  }
}

const FOLLOW_UP_RESET_DELAYS_MS = [0, 50, 150] as const;

type ScheduleWorkspaceScrollResetOptions = {
  /** Extra timeouts after paint — overrides Next.js / browser scroll restoration. */
  includeDelayed?: boolean;
};

/**
 * Resets scroll immediately and on the next frames.
 * Needed when entering `/user` from marketing home (long page scroll carries over).
 */
export function scheduleWorkspaceScrollReset(
  options: ScheduleWorkspaceScrollResetOptions = {},
): () => void {
  const { includeDelayed = false } = options;

  resetWorkspaceScrollPosition();

  let raf2 = 0;
  const raf1 = requestAnimationFrame(() => {
    resetWorkspaceScrollPosition();
    raf2 = requestAnimationFrame(resetWorkspaceScrollPosition);
  });

  const timeoutIds: number[] = [];
  if (includeDelayed) {
    for (const delayMs of FOLLOW_UP_RESET_DELAYS_MS) {
      timeoutIds.push(window.setTimeout(resetWorkspaceScrollPosition, delayMs));
    }
  }

  return () => {
    cancelAnimationFrame(raf1);
    cancelAnimationFrame(raf2);
    for (const id of timeoutIds) {
      window.clearTimeout(id);
    }
  };
}
