"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";

export const SCHEDULE_SWITCH_TRANSITION_MS = 300;
export const SCHEDULE_CARD_STAGGER_MS = 45;
export const SCHEDULE_MAX_STAGGERED_ITEMS = 8;
const SCHEDULE_EXIT_TRANSITION_MS = 180;
const HEIGHT_RESET_BUFFER_MS = 80;

export type ScheduleAnimationPhase = "idle" | "exit" | "enter";

type UseScheduleDayTransitionInput = {
  selectedDayKey: string;
  visibleSessions: MarketingScheduleItem[];
};

type UseScheduleDayTransitionResult = {
  contentRef: RefObject<HTMLDivElement | null>;
  renderedDayKey: string;
  renderedSessions: MarketingScheduleItem[];
  animationPhase: ScheduleAnimationPhase;
  containerStyle?: CSSProperties;
  getItemStyle: (index: number) => CSSProperties;
};

export function useScheduleDayTransition({
  selectedDayKey,
  visibleSessions,
}: UseScheduleDayTransitionInput): UseScheduleDayTransitionResult {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const startTimerRef = useRef<number | null>(null);
  const switchTimerRef = useRef<number | null>(null);
  const enterResetTimerRef = useRef<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<ScheduleAnimationPhase>("idle");
  const [renderedDayKey, setRenderedDayKey] = useState(selectedDayKey);
  const [renderedSessions, setRenderedSessions] = useState(visibleSessions);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    clearTimer(startTimerRef.current);
    clearTimer(switchTimerRef.current);
    clearTimer(enterResetTimerRef.current);
    startTimerRef.current = null;
    switchTimerRef.current = null;
    enterResetTimerRef.current = null;

    if (prefersReducedMotion) return;

    if (renderedDayKey === selectedDayKey) {
      startTimerRef.current = window.setTimeout(() => {
        setRenderedSessions(visibleSessions);
        setAnimationPhase("enter");
        enterResetTimerRef.current = window.setTimeout(
          () => setAnimationPhase("idle"),
          SCHEDULE_SWITCH_TRANSITION_MS,
        );
      }, 0);
      return;
    }

    startTimerRef.current = window.setTimeout(() => {
      setAnimationPhase("exit");
      switchTimerRef.current = window.setTimeout(() => {
        setRenderedDayKey(selectedDayKey);
        setRenderedSessions(visibleSessions);
        setAnimationPhase("enter");
        enterResetTimerRef.current = window.setTimeout(
          () => setAnimationPhase("idle"),
          SCHEDULE_SWITCH_TRANSITION_MS,
        );
      }, SCHEDULE_EXIT_TRANSITION_MS);
    }, 0);
  }, [prefersReducedMotion, renderedDayKey, selectedDayKey, visibleSessions]);

  const currentDayKey = prefersReducedMotion ? selectedDayKey : renderedDayKey;
  const currentSessions = prefersReducedMotion ? visibleSessions : renderedSessions;
  const currentPhase = prefersReducedMotion ? "idle" : animationPhase;

  useLayoutEffect(() => {
    if (contentRef.current === null) return;
    const measured = contentRef.current.scrollHeight;
    setContainerHeight((prev) => (prev === measured ? prev : measured));
    const resetTimer = window.setTimeout(
      () => setContainerHeight(null),
      SCHEDULE_SWITCH_TRANSITION_MS + HEIGHT_RESET_BUFFER_MS,
    );
    return () => window.clearTimeout(resetTimer);
  }, [currentDayKey, currentPhase, currentSessions]);

  useEffect(() => {
    return () => {
      clearTimer(startTimerRef.current);
      clearTimer(switchTimerRef.current);
      clearTimer(enterResetTimerRef.current);
    };
  }, []);

  return {
    contentRef,
    renderedDayKey: currentDayKey,
    renderedSessions: currentSessions,
    animationPhase: currentPhase,
    containerStyle: containerHeight === null ? undefined : { height: containerHeight },
    getItemStyle: (index) =>
      ({
        "--schedule-item-delay": `${Math.min(index, SCHEDULE_MAX_STAGGERED_ITEMS) * SCHEDULE_CARD_STAGGER_MS}ms`,
      }) as CSSProperties,
  };
}

function clearTimer(timer: number | null): void {
  if (timer !== null) {
    window.clearTimeout(timer);
  }
}
