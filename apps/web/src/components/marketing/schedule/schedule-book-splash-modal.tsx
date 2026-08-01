"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { HomeFooterSphereBounce } from "@/components/marketing/home/home-footer-sphere-bounce";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";
import { measureScheduleBookSplashSphereGroundY } from "@/components/marketing/schedule/schedule-book-splash-sphere-ground";
import {
  SCHEDULE_BOOK_SPLASH_SPHERE_BOUNCE,
  SCHEDULE_BOOK_SPLASH_SPHERE_SIZE,
} from "@/components/marketing/schedule/schedule-book-splash-sphere-tokens";
import styles from "@/components/marketing/schedule/schedule-book-splash-modal.module.css";
import { OmmModalPortal } from "@/components/ui/omm-modal";

export const SCHEDULE_BOOK_SPLASH_VISIBLE_MS = 4_500;

/** Keep in sync with `.panelExit` animation duration. */
export const SCHEDULE_BOOK_SPLASH_EXIT_MS = 480;

/** Minimum time the splash stays up before handing off to subscribe / package modals. */
export const SCHEDULE_BOOK_SPLASH_HANDOFF_MIN_VISIBLE_MS = 1_100;

type ScheduleBookSplashVariant = "member" | "guest";

type ScheduleBookSplashModalProps = {
  isOpen: boolean;
  variant: ScheduleBookSplashVariant;
  /** Fires after the exit animation finishes (auto-dismiss or early close). */
  onDismiss: () => void;
};

type SplashPhase = "enter" | "exit";

export function ScheduleBookSplashModal({
  isOpen,
  variant,
  onDismiss,
}: ScheduleBookSplashModalProps) {
  const t = useTranslations("marketingPages.schedule.bookSplash");
  const tNav = useTranslations("nav");
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<SplashPhase>("enter");
  const onDismissRef = useRef(onDismiss);
  const mountedRef = useRef(false);
  const exitingRef = useRef(false);

  const logoStageStyle = {
    "--schedule-splash-sphere-width": `${SCHEDULE_BOOK_SPLASH_SPHERE_SIZE.widthPx}px`,
    "--schedule-splash-sphere-height": `${SCHEDULE_BOOK_SPLASH_SPHERE_SIZE.heightPx}px`,
    "--schedule-splash-sphere-bounce-drop": `${SCHEDULE_BOOK_SPLASH_SPHERE_BOUNCE.maxDropPx}px`,
  } as CSSProperties;

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (isOpen) {
      exitingRef.current = false;
      mountedRef.current = true;
      setMounted(true);
      setPhase("enter");

      const exitTimer = window.setTimeout(() => {
        setPhase("exit");
        exitingRef.current = true;
      }, SCHEDULE_BOOK_SPLASH_VISIBLE_MS);

      const hideTimer = window.setTimeout(() => {
        mountedRef.current = false;
        setMounted(false);
        exitingRef.current = false;
        onDismissRef.current();
      }, SCHEDULE_BOOK_SPLASH_VISIBLE_MS + SCHEDULE_BOOK_SPLASH_EXIT_MS);

      return () => {
        window.clearTimeout(exitTimer);
        window.clearTimeout(hideTimer);
      };
    }

    if (!mountedRef.current) {
      return undefined;
    }

    if (!exitingRef.current) {
      exitingRef.current = true;
      setPhase("exit");
    }

    const hideTimer = window.setTimeout(() => {
      mountedRef.current = false;
      setMounted(false);
      exitingRef.current = false;
      onDismissRef.current();
    }, SCHEDULE_BOOK_SPLASH_EXIT_MS);

    return () => {
      window.clearTimeout(hideTimer);
    };
  }, [isOpen]);

  if (!mounted) {
    return null;
  }

  const panelMotionClass = phase === "exit" ? styles.panelExit : styles.panelEnter;
  const title = variant === "guest" ? t("guestTitle") : t("title");
  const body = variant === "guest" ? t("guestBody") : t("body");

  return (
    <OmmModalPortal
      isOpen
      onClose={() => undefined}
      backdropAriaLabel={t("closeAria")}
      closeDisabled
      ariaLabelledBy={titleId}
      overlayClassName={styles.overlay}
      panelClassName="relative z-10 w-full max-w-md"
      centered
      closeOnEscape={false}
    >
      <div className={`${styles.panel} ${panelMotionClass}`}>
        <div
          className={styles.logoStage}
          data-schedule-book-splash-sphere-stage
          style={logoStageStyle}
        >
          <HomeFooterSphereBounce
            className={styles.logoFrame}
            bounceConfig={SCHEDULE_BOOK_SPLASH_SPHERE_BOUNCE}
            measureGroundY={measureScheduleBookSplashSphereGroundY}
          >
            <Image
              src={HOME_SECTION_ASSETS.footerIllustration}
              alt=""
              aria-hidden
              fill
              sizes={`${SCHEDULE_BOOK_SPLASH_SPHERE_SIZE.widthPx}px`}
              className={styles.logoImage}
              priority
            />
          </HomeFooterSphereBounce>
        </div>
        <p className={styles.brand}>{tNav("studioBrand")}</p>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p className={styles.body}>{body}</p>
      </div>
    </OmmModalPortal>
  );
}
