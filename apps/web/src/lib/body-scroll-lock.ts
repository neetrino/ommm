const WORKSPACE_SCROLL_PANE_SELECTOR = "[data-workspace-scroll-pane]";

/** Scroll containers that must keep touch scrolling while the backdrop is locked. */
const ALLOWED_TOUCH_SCROLL_SELECTOR =
  ".ommm-member-hub-sheet-overlay, .ommm-member-hub-sheet-panel, .ommm-member-notifications-desktop-panel, .ommm-package-subscribe-mobile-overlay, .ommm-package-subscribe-mobile-panel, .ommm-package-subscribe-desktop-panel, .ommm-modal-overlay, .ommm-drawer-overlay";

let lockCount = 0;
let savedScrollY = 0;

type ScrollLockSnapshot = {
  htmlOverflow: string;
  bodyOverflow: string;
  bodyPaddingRight: string;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyWidth: string;
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
 * Locks background scroll while modals/sheets stay scrollable.
 * Uses `position: fixed` on body so iOS Safari keeps viewport-fixed overlays visible.
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
      bodyPosition: document.body.style.position,
      bodyTop: document.body.style.top,
      bodyLeft: document.body.style.left,
      bodyRight: document.body.style.right,
      bodyWidth: document.body.style.width,
      paneOverflow: pane?.style.overflow ?? null,
    };

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

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
    document.body.style.position = snapshot.bodyPosition;
    document.body.style.top = snapshot.bodyTop;
    document.body.style.left = snapshot.bodyLeft;
    document.body.style.right = snapshot.bodyRight;
    document.body.style.width = snapshot.bodyWidth;

    if (pane) {
      pane.style.overflow = snapshot.paneOverflow ?? "";
    }

    snapshot = null;
    window.scrollTo(0, savedScrollY);
  };
}
