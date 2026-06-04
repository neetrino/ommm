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
  isHomeLazySectionMounted,
  markHomeLazySectionMounted,
} from "@/lib/home-lazy-section-mount-state";

type ProgressiveRevealSectionProps = {
  id: string;
  children: ReactNode;
  preloadMarginPx?: number;
  mountMarginPx?: number;
  prefetchApiPaths?: readonly string[];
  placeholderClassName?: string;
};

const prefetchedApiPaths = new Set<string>();
const inFlightPrefetches = new Map<string, Promise<void>>();

function subscribeToHydrationStore(): () => void {
  return () => undefined;
}

function getHydratedSnapshot(): boolean {
  return true;
}

function getServerHydratedSnapshot(): boolean {
  return false;
}

function prefetchApiPath(path: string): Promise<void> {
  if (prefetchedApiPaths.has(path)) {
    return Promise.resolve();
  }
  const inFlight = inFlightPrefetches.get(path);
  if (inFlight) {
    return inFlight;
  }

  const request = fetch(path, {
    method: "GET",
    credentials: "include",
  })
    .then(() => {
      prefetchedApiPaths.add(path);
    })
    .catch(() => {
      // Prefetch is a best-effort optimization and should not block rendering.
    })
    .finally(() => {
      inFlightPrefetches.delete(path);
    });

  inFlightPrefetches.set(path, request);
  return request;
}

/** Mounts children when the section nears the viewport — no entrance animation. */
export function ProgressiveRevealSection({
  id,
  children,
  preloadMarginPx = 520,
  mountMarginPx = 380,
  prefetchApiPaths = [],
  placeholderClassName = "h-[clamp(24rem,48vw,44rem)]",
}: ProgressiveRevealSectionProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const hasHydrated = useSyncExternalStore(
    subscribeToHydrationStore,
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  );
  const [shouldMount, setShouldMount] = useState(false);
  const hasMountedBefore = hasHydrated && isHomeLazySectionMounted(id);
  const showChildren = hasHydrated && (shouldMount || hasMountedBefore);

  const resolvedPrefetchPaths = useMemo(
    () => Array.from(new Set(prefetchApiPaths)),
    [prefetchApiPaths],
  );

  useEffect(() => {
    if (!hasHydrated || showChildren) {
      return undefined;
    }

    const element = containerRef.current;
    if (!element) {
      return undefined;
    }

    let prefetchStarted = false;

    const mountThreshold = () => window.innerHeight + mountMarginPx;

    const tryMount = () => {
      if (element.getBoundingClientRect().top <= mountThreshold()) {
        setShouldMount(true);
        markHomeLazySectionMounted(id);
        return true;
      }
      return false;
    };

    const startPrefetch = () => {
      if (prefetchStarted || resolvedPrefetchPaths.length === 0) {
        return;
      }
      prefetchStarted = true;
      void Promise.all(resolvedPrefetchPaths.map((path) => prefetchApiPath(path)));
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
        startPrefetch();
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
  }, [hasHydrated, id, mountMarginPx, preloadMarginPx, resolvedPrefetchPaths, showChildren]);

  return (
    <section ref={containerRef} data-home-section={id} className="relative">
      {showChildren ? children : <div aria-hidden className={placeholderClassName} />}
    </section>
  );
}
