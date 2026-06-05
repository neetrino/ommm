"use client";

import { useEffect, useRef, useState } from "react";
import { CONTACT_PAGE_CARD_SHELL_CLASS } from "@/components/marketing/contact/contact-page-tokens";
import { MARKETING_LAZY_SECTION } from "@/components/marketing/marketing-lazy-section-tokens";
import styles from "@/components/marketing/contact/marketing-contact-page-content.module.css";

type MarketingLazyMapEmbedProps = {
  heading: string;
  embedHtml: string;
};

const MAP_MOUNT_MARGIN_PX = MARKETING_LAZY_SECTION.mountMarginPx;

/** Renders the studio map iframe only when the section nears the viewport. */
export function MarketingLazyMapEmbed({ heading, embedHtml }: MarketingLazyMapEmbedProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [shouldRenderMap, setShouldRenderMap] = useState(false);

  useEffect(() => {
    if (shouldRenderMap) {
      return undefined;
    }

    const element = containerRef.current;
    if (!element) {
      return undefined;
    }

    const mountThreshold = () => window.innerHeight + MAP_MOUNT_MARGIN_PX;

    const tryMount = () => {
      if (element.getBoundingClientRect().top <= mountThreshold()) {
        setShouldRenderMap(true);
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
        rootMargin: `0px 0px ${MARKETING_LAZY_SECTION.preloadMarginPx}px 0px`,
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
  }, [shouldRenderMap]);

  return (
    <section ref={containerRef} className={styles.mapSection}>
      <h2 className={styles.mapHeading}>{heading}</h2>
      {shouldRenderMap ? (
        <div
          className={`${CONTACT_PAGE_CARD_SHELL_CLASS} ${styles.mapFrame}`}
          dangerouslySetInnerHTML={{ __html: embedHtml }}
        />
      ) : (
        <div aria-hidden className={MARKETING_LAZY_SECTION.placeholders.mapEmbed} />
      )}
    </section>
  );
}
