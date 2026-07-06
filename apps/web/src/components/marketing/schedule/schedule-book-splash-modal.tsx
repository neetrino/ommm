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
import { OMM_MODAL_OVERLAY_CLASS, OmmModalPortal } from "@/components/ui/omm-modal";

export const SCHEDULE_BOOK_SPLASH_VISIBLE_MS = 4_500;

const SCHEDULE_BOOK_SPLASH_EXIT_MS = 320;

type ScheduleBookSplashVariant = "member" | "guest";

type ScheduleBookSplashModalProps = {
  isOpen: boolean;
  variant: ScheduleBookSplashVariant;
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
  const [phase, setPhase] = useState<SplashPhase>("enter");
  const onDismissRef = useRef(onDismiss);

  const logoStageStyle = {
    "--schedule-splash-sphere-width": `${SCHEDULE_BOOK_SPLASH_SPHERE_SIZE.widthPx}px`,
    "--schedule-splash-sphere-height": `${SCHEDULE_BOOK_SPLASH_SPHERE_SIZE.heightPx}px`,
    "--schedule-splash-sphere-bounce-drop": `${SCHEDULE_BOOK_SPLASH_SPHERE_BOUNCE.maxDropPx}px`,
  } as CSSProperties;

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const resetPhaseTimer = window.setTimeout(() => {
      setPhase("enter");
    }, 0);

    const exitTimer = window.setTimeout(() => {
      setPhase("exit");
    }, SCHEDULE_BOOK_SPLASH_VISIBLE_MS);

    const hideTimer = window.setTimeout(() => {
      onDismissRef.current();
    }, SCHEDULE_BOOK_SPLASH_VISIBLE_MS + SCHEDULE_BOOK_SPLASH_EXIT_MS);

    return () => {
      window.clearTimeout(resetPhaseTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, [isOpen]);

  const panelMotionClass = phase === "exit" ? styles.panelExit : styles.panelEnter;
  const title = variant === "guest" ? t("guestTitle") : t("title");
  const body = variant === "guest" ? t("guestBody") : t("body");

  return (
    <OmmModalPortal
      isOpen={isOpen}
      onClose={onDismiss}
      backdropAriaLabel={t("closeAria")}
      closeDisabled={phase === "exit"}
      ariaLabelledBy={titleId}
      overlayClassName={`${OMM_MODAL_OVERLAY_CLASS} ${styles.overlay}`}
      panelClassName="relative z-10 w-full max-w-md px-4 sm:px-0"
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
