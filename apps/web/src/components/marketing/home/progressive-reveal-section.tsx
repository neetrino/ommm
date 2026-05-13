"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ProgressiveRevealSectionProps = {
  id: string;
  children: ReactNode;
  preloadMarginPx?: number;
  mountMarginPx?: number;
  prefetchApiPaths?: readonly string[];
  placeholderClassName?: string;
  revealDelayMs?: number;
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

export function ProgressiveRevealSection({
  id,
  children,
  preloadMarginPx = 520,
  mountMarginPx = 380,
  prefetchApiPaths = [],
  placeholderClassName = "h-[clamp(24rem,48vw,44rem)]",
  revealDelayMs = 0,
}: ProgressiveRevealSectionProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [shouldMount, setShouldMount] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const resolvedPrefetchPaths = useMemo(
    () => Array.from(new Set(prefetchApiPaths)),
    [prefetchApiPaths],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };
    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);
    return () => {
      mediaQuery.removeEventListener("change", syncPreference);
    };
  }, []);

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
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          return;
        }
        setShouldMount(true);
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
  }, [mountMarginPx]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !shouldMount) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          return;
        }
        setIsVisible(true);
        observer.disconnect();
      },
      {
        root: null,
        rootMargin: prefersReducedMotion ? "0px 0px 0px 0px" : "0px 0px -10% 0px",
        threshold: prefersReducedMotion ? 0 : 0.15,
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [prefersReducedMotion, shouldMount]);

  const revealClassName = prefersReducedMotion
    ? "opacity-100 translate-y-0 scale-100 blur-0"
    : isVisible
      ? "opacity-100 translate-y-0 scale-100 blur-0"
      : "opacity-0 translate-y-8 scale-[0.985] blur-[6px]";

  return (
    <section ref={containerRef} data-home-section={id} className="relative">
      {shouldMount ? (
        <div
          className={`will-change-[opacity,transform,filter] transform-gpu transition-[opacity,transform,filter] duration-[820ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${revealClassName}`}
          style={{
            transitionDelay:
              !prefersReducedMotion && isVisible ? `${revealDelayMs}ms` : "0ms",
          }}
        >
          {children}
        </div>
      ) : (
        <div aria-hidden className={placeholderClassName} />
      )}
    </section>
  );
}
