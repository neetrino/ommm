const WORKSPACE_SCROLL_PANE_SELECTOR = "[data-workspace-scroll-pane]";

/** Scroll containers that must keep touch scrolling while the backdrop is locked. */
const ALLOWED_TOUCH_SCROLL_SELECTOR =
  ".ommm-member-hub-sheet-panel, .ommm-modal-overlay, .ommm-drawer-overlay";

let lockCount = 0;
let savedScrollY = 0;

type ScrollLockSnapshot = {
  htmlOverflow: string;
  bodyOverflow: string;
  bodyPaddingRight: string;
  paneOverflow: string | null;
};

let snapshot: ScrollLockSnapshot | null = null;
let touchMoveListener: ((event: TouchEvent) => void) | null = null;

function isAllowedTouchScrollTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  if (target.closest(ALLOWED_TOUCH_SCROLL_SELECTOR)) {
    return true;
  }

  let el: Element | null = target;
  while (el && el !== document.body) {
    const { overflowY } = window.getComputedStyle(el);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight
    ) {
      return true;
    }
    el = el.parentElement;
  }

  return false;
}

function onLockedTouchMove(event: TouchEvent): void {
  if (isAllowedTouchScrollTarget(event.target)) {
    return;
  }

  event.preventDefault();
}

/**
 * Locks background scroll while modals/sheets stay scrollable (iOS-safe for member hub).
 * Ref-counted — safe when multiple overlays lock at once.
 */
export function lockBodyScroll(): () => void {
  lockCount += 1;

  if (lockCount === 1 && typeof document !== "undefined") {
    savedScrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const pane = document.querySelector<HTMLElement>(WORKSPACE_SCROLL_PANE_SELECTOR);

    snapshot = {
      htmlOverflow: document.documentElement.style.overflow,
      bodyOverflow: document.body.style.overflow,
      bodyPaddingRight: document.body.style.paddingRight,
      paneOverflow: pane?.style.overflow ?? null,
    };

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    if (pane) {
      pane.style.overflow = "hidden";
    }

    touchMoveListener = onLockedTouchMove;
    document.addEventListener("touchmove", touchMoveListener, { passive: false });
  }

  return () => {
    lockCount = Math.max(0, lockCount - 1);

    if (lockCount !== 0 || typeof document === "undefined" || snapshot === null) {
      return;
    }

    const pane = document.querySelector<HTMLElement>(WORKSPACE_SCROLL_PANE_SELECTOR);

    if (touchMoveListener) {
      document.removeEventListener("touchmove", touchMoveListener);
      touchMoveListener = null;
    }

    document.documentElement.style.overflow = snapshot.htmlOverflow;
    document.body.style.overflow = snapshot.bodyOverflow;
    document.body.style.paddingRight = snapshot.bodyPaddingRight;

    if (pane) {
      pane.style.overflow = snapshot.paneOverflow ?? "";
    }

    snapshot = null;
    window.scrollTo(0, savedScrollY);
  };
}
