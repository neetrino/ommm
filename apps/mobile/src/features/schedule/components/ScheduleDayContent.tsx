import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import type { ClassSessionRow } from "../../../lib/api/memberClient";
import { SCHEDULE_PAGE_MOBILE } from "../../../lib/schedule/schedulePageTokens";
import { ScheduleEmptyState } from "./ScheduleEmptyState";
import { ScheduleSessionRow } from "./ScheduleSessionRow";
import {
  SCHEDULE_SWITCH_TRANSITION_MS,
  type ScheduleAnimationPhase,
} from "../hooks/useScheduleDayTransition";

type ScheduleAnimatedSessionItemProps = {
  animationPhase: ScheduleAnimationPhase;
  delayMs: number;
  children: React.ReactNode;
};

function ScheduleAnimatedSessionItem({
  animationPhase,
  delayMs,
  children,
}: ScheduleAnimatedSessionItemProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animationPhase !== "enter") {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    opacity.setValue(0);
    translateY.setValue(8);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: SCHEDULE_SWITCH_TRANSITION_MS,
        delay: delayMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: SCHEDULE_SWITCH_TRANSITION_MS,
        delay: delayMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [animationPhase, delayMs, opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>
  );
}

type ScheduleDayContentProps = {
  locale: string;
  animationPhase: ScheduleAnimationPhase;
  containerStyle: {
    opacity: Animated.Value;
    transform: { translateY: Animated.Value }[];
  };
  renderedSessions: readonly ClassSessionRow[];
  getItemDelayMs: (index: number) => number;
  onBookPress: (session: ClassSessionRow) => void;
  bookingSessionId: string | null;
};

export function ScheduleDayContent({
  locale,
  animationPhase,
  containerStyle,
  renderedSessions,
  getItemDelayMs,
  onBookPress,
  bookingSessionId,
}: ScheduleDayContentProps) {
  return (
    <Animated.View style={[styles.panel, containerStyle]}>
      {renderedSessions.length === 0 ? (
        <ScheduleEmptyState />
      ) : (
        <View style={styles.sessionList}>
          {renderedSessions.map((session, index) => (
            <ScheduleAnimatedSessionItem
              key={session.id}
              animationPhase={animationPhase}
              delayMs={getItemDelayMs(index)}
            >
              <ScheduleSessionRow
                session={session}
                locale={locale}
                onBookPress={onBookPress}
                booking={bookingSessionId === session.id}
              />
            </ScheduleAnimatedSessionItem>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {},
  sessionList: {    gap: SCHEDULE_PAGE_MOBILE.sessionListGapPx,
  },
});
