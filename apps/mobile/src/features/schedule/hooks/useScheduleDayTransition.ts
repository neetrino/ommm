import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing } from "react-native";

/** Mirrors web `use-schedule-day-transition.ts` + `marketing-schedule-view.module.css`. */
export const SCHEDULE_SWITCH_TRANSITION_MS = 300;
export const SCHEDULE_EXIT_TRANSITION_MS = 180;
export const SCHEDULE_CARD_STAGGER_MS = 45;
export const SCHEDULE_MAX_STAGGERED_ITEMS = 8;

export type ScheduleAnimationPhase = "idle" | "exit" | "enter";

const ENTER_EASING = Easing.out(Easing.cubic);
const EXIT_EASING = Easing.out(Easing.cubic);

type UseScheduleDayTransitionParams<TSession> = {
  selectedDayKey: string;
  visibleSessions: readonly TSession[];
};

type UseScheduleDayTransitionResult<TSession> = {
  renderedDayKey: string;
  renderedSessions: readonly TSession[];
  animationPhase: ScheduleAnimationPhase;
  containerStyle: {
    opacity: Animated.Value;
    transform: { translateY: Animated.Value }[];
  };
  getItemDelayMs: (index: number) => number;
};

export function useScheduleDayTransition<TSession>({
  selectedDayKey,
  visibleSessions,
}: UseScheduleDayTransitionParams<TSession>): UseScheduleDayTransitionResult<TSession> {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const renderedDayKeyRef = useRef(selectedDayKey);
  const selectedDayKeyRef = useRef(selectedDayKey);
  const visibleSessionsRef = useRef(visibleSessions);
  visibleSessionsRef.current = visibleSessions;
  selectedDayKeyRef.current = selectedDayKey;

  const [renderedDayKey, setRenderedDayKey] = useState(selectedDayKey);
  const [renderedSessions, setRenderedSessions] = useState(visibleSessions);
  const [animationPhase, setAnimationPhase] = useState<ScheduleAnimationPhase>("idle");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (renderedDayKeyRef.current === selectedDayKey && animationPhase === "idle") {
      setRenderedSessions(visibleSessions);
    }
  }, [animationPhase, selectedDayKey, visibleSessions]);

  useEffect(() => {
    if (reduceMotion) {
      renderedDayKeyRef.current = selectedDayKey;
      setRenderedDayKey(selectedDayKey);
      setRenderedSessions(visibleSessionsRef.current);
      setAnimationPhase("idle");
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    if (renderedDayKeyRef.current === selectedDayKey) {
      return;
    }

    let cancelled = false;
    const targetDayKey = selectedDayKey;

    setAnimationPhase("exit");

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: SCHEDULE_EXIT_TRANSITION_MS,
        easing: EXIT_EASING,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 8,
        duration: SCHEDULE_EXIT_TRANSITION_MS,
        easing: EXIT_EASING,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (cancelled || !finished || targetDayKey !== selectedDayKeyRef.current) {
        return;
      }

      renderedDayKeyRef.current = targetDayKey;
      setRenderedDayKey(targetDayKey);
      setRenderedSessions(visibleSessionsRef.current);
      translateY.setValue(10);
      opacity.setValue(0);
      setAnimationPhase("enter");

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: SCHEDULE_SWITCH_TRANSITION_MS,
          easing: ENTER_EASING,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: SCHEDULE_SWITCH_TRANSITION_MS,
          easing: ENTER_EASING,
          useNativeDriver: true,
        }),
      ]).start(({ finished: enterFinished }) => {
        if (cancelled || targetDayKey !== selectedDayKeyRef.current) {
          return;
        }

        if (enterFinished) {
          setAnimationPhase("idle");
          opacity.setValue(1);
          translateY.setValue(0);
        }
      });
    });

    return () => {
      cancelled = true;
      opacity.stopAnimation();
      translateY.stopAnimation();
    };
  }, [opacity, reduceMotion, selectedDayKey, translateY]);

  const currentDayKey = reduceMotion ? selectedDayKey : renderedDayKey;
  const currentSessions = reduceMotion
    ? visibleSessions
    : renderedDayKeyRef.current === selectedDayKey
      ? visibleSessions
      : renderedSessions;
  const currentPhase = reduceMotion ? "idle" : animationPhase;

  return {
    renderedDayKey: currentDayKey,
    renderedSessions: currentSessions,
    animationPhase: currentPhase,
    containerStyle: {
      opacity,
      transform: [{ translateY }],
    },
    getItemDelayMs: (index: number) =>
      Math.min(index, SCHEDULE_MAX_STAGGERED_ITEMS) * SCHEDULE_CARD_STAGGER_MS,
  };
};
