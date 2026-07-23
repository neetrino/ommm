"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  isLazySectionMounted,
  markLazySectionMounted,
} from "@/lib/lazy-section-mount-state";

type MarketingProgressiveRevealSectionProps = {
  scope?: string;
  id: string;
  children: ReactNode;
  preloadMarginPx?: number;
  mountMarginPx?: number;
  placeholderClassName?: string;
};

function subscribeToHydrationStore(): () => void {
  return () => undefined;
}

function getHydratedSnapshot(): boolean {
  return true;
}

function getServerHydratedSnapshot(): boolean {
  return false;
}

/** Mounts children when the section nears the viewport — defers JS and below-fold work. */
export function MarketingProgressiveRevealSection({
  scope = "marketing",
  id,
  children,
  preloadMarginPx = 480,
  mountMarginPx = 360,
  placeholderClassName = "h-40",
}: MarketingProgressiveRevealSectionProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const hasHydrated = useSyncExternalStore(
    subscribeToHydrationStore,
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  );
  const [shouldMount, setShouldMount] = useState(false);
  const hasMountedBefore = hasHydrated && isLazySectionMounted(scope, id);
  const showChildren = hasHydrated && (shouldMount || hasMountedBefore);

  const sectionId = useMemo(() => `${scope}:${id}`, [id, scope]);

  useEffect(() => {
    if (!hasHydrated || showChildren) {
      return undefined;
    }

    const element = containerRef.current;
    if (!element) {
      return undefined;
    }

    const mountThreshold = () => window.innerHeight + mountMarginPx;

    const tryMount = () => {
      if (element.getBoundingClientRect().top <= mountThreshold()) {
        setShouldMount(true);
        markLazySectionMounted(scope, id);
        return true;
      }
      return false;
    };

    const onScrollOrResize = () => {
      if (tryMount()) {
        cleanup();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          return;
        }
        if (tryMount()) {
          cleanup();
        }
      },
      {
        root: null,
        rootMargin: `0px 0px ${preloadMarginPx}px 0px`,
        threshold: 0,
      },
    );

    const cleanup = () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };

    observer.observe(element);
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    return cleanup;
  }, [hasHydrated, id, mountMarginPx, preloadMarginPx, scope, showChildren]);

  return (
    <section ref={containerRef} data-marketing-lazy-section={sectionId} className="relative">
      {showChildren ? children : <div aria-hidden className={placeholderClassName} />}
    </section>
  );
}
