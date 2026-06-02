"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
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
  const [shouldMount, setShouldMount] = useState(() => isHomeLazySectionMounted(id));

  const resolvedPrefetchPaths = useMemo(
    () => Array.from(new Set(prefetchApiPaths)),
    [prefetchApiPaths],
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element || resolvedPrefetchPaths.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          return;
        }
        void Promise.all(resolvedPrefetchPaths.map((path) => prefetchApiPath(path)));
        observer.disconnect();
      },
      {
        root: null,
        rootMargin: `0px 0px ${preloadMarginPx}px 0px`,
        threshold: 0,
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [preloadMarginPx, resolvedPrefetchPaths]);

  useEffect(() => {
    if (shouldMount) {
      return undefined;
    }

    const element = containerRef.current;
    if (!element) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          return;
        }
        setShouldMount(true);
        markHomeLazySectionMounted(id);
        observer.disconnect();
      },
      {
        root: null,
        rootMargin: `0px 0px ${mountMarginPx}px 0px`,
        threshold: 0,
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [id, mountMarginPx, shouldMount]);

  return (
    <section ref={containerRef} data-home-section={id} className="relative">
      {shouldMount ? children : <div aria-hidden className={placeholderClassName} />}
    </section>
  );
}
