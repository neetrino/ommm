import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ClassSessionRow } from "../../../lib/api/memberClient";
import { SCHEDULE_PAGE_MOBILE } from "../../../lib/schedule/schedulePageTokens";
import { resolveScheduleRowGradientColors } from "../../../lib/schedule/scheduleRowGradients";
import { fontFamilies } from "../../../theme/fontFamilies";
import { platformShadow } from "../../../theme/platformShadow";
import { formatScheduleTimeHHmm } from "../scheduleFormat";
import { useScheduleCopy } from "../useScheduleCopy";
import { scheduleColors, scheduleLayout } from "../scheduleTokens";

type ScheduleSessionRowProps = {
  session: ClassSessionRow;
  locale: string;
  onBookPress: (session: ClassSessionRow) => void;
  booking?: boolean;
};

/** Mirrors web mobile session row (`home-weekly-schedule-session-row` ≤743px). */
const CLOCK_ICON_SIZE = 20;
const HEADER_TO_DETAILS_GAP = 17;
const BOOK_BTN_MIN_WIDTH = 72;

function isSessionFull(session: ClassSessionRow): boolean {
  return session.status === "FULL" || session._count.bookings >= session.capacity;
}

export function ScheduleSessionRow({
  session,
  locale,
  onBookPress,
  booking = false,
}: ScheduleSessionRowProps) {
  const scheduleCopy = useScheduleCopy();
  const coach = session.coach.user.name?.trim() || scheduleCopy.coachLabel;
  const classType = session.classType.name.trim();
  const timeLabel = formatScheduleTimeHHmm(session.startsAt, locale);
  const durationLabel = scheduleCopy.minutesShort(
    Math.max(
      1,
      Math.round(
        (new Date(session.endsAt).getTime() -
          new Date(session.startsAt).getTime()) /
          60000,
      ),
    ),
  );
  const spotsLeft = Math.max(session.capacity - session._count.bookings, 0);
  const full = isSessionFull(session);
  const spotsUrgent =
    !full && spotsLeft <= SCHEDULE_PAGE_MOBILE.spotsUrgentThreshold;
  const gradientColors = resolveScheduleRowGradientColors(classType);

  return (
    <View style={styles.shadowShell}>
      <View style={styles.clipShell}>
        <LinearGradient
          colors={[gradientColors[0], gradientColors[1]]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradientFill}
        />
        <View style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.timeCluster}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={CLOCK_ICON_SIZE}
                color={scheduleColors.ink}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <Text style={styles.timeLabel}>{timeLabel}</Text>
            </View>

            <Pressable
              onPress={() => onBookPress(session)}
              disabled={booking}
              style={({ pressed }) => [
                styles.bookBtn,
                pressed && !booking && styles.bookBtnPressed,
                booking && styles.bookBtnDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel={scheduleCopy.bookCta}
            >
              <Text style={styles.bookBtnLabel}>{scheduleCopy.bookCta}</Text>
            </Pressable>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.classBlock}>
              <Text style={styles.classTitle} numberOfLines={1}>
                {classType}
              </Text>
              <Text style={styles.instructor}>
                {scheduleCopy.withInstructor(coach)}
              </Text>
            </View>

            <View style={styles.metaCol}>
              <Text style={styles.durationLabel}>{durationLabel}</Text>
              <Text
                style={[styles.spots, spotsUrgent && styles.spotsUrgent]}
              >
                {full
                  ? scheduleCopy.spotsFull
                  : scheduleCopy.spotsLeft(spotsLeft)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const CARD_RADIUS = scheduleLayout.rowRadius;

const styles = StyleSheet.create({
  shadowShell: {
    borderRadius: CARD_RADIUS,
    ...platformShadow({
      color: "#2d2823",
      offsetHeight: 18,
      opacity: 0.13,
      radius: 28,
      elevation: 2,
    }),
  },
  clipShell: {
    overflow: "hidden",
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: scheduleColors.rowBorder,
  },
  gradientFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_RADIUS,
  },
  card: {
    gap: HEADER_TO_DETAILS_GAP,
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  timeCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
    minWidth: 0,
  },
  timeLabel: {
    fontFamily: fontFamilies.manrope.bold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: scheduleColors.ink,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  classBlock: {
    flex: 1,
    minWidth: 0,
    gap: 0,
  },
  classTitle: {
    fontFamily: fontFamilies.manrope.bold,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0.6,
    color: scheduleColors.ink,
  },
  instructor: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: 12,
    lineHeight: 16,
    color: scheduleColors.body,
  },
  metaCol: {
    alignItems: "flex-end",
    gap: 0,
    flexShrink: 0,
  },
  durationLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 14,
    lineHeight: 28,
    letterSpacing: 0.5,
    color: scheduleColors.body,
    textAlign: "right",
  },
  spots: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: scheduleColors.body,
    textAlign: "right",
  },
  spotsUrgent: {
    color: scheduleColors.spotsUrgent,
  },
  bookBtn: {
    minWidth: BOOK_BTN_MIN_WIDTH,
    height: scheduleLayout.bookBtnHeight,
    minHeight: scheduleLayout.bookBtnHeight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: scheduleColors.bookBtnBorder,
    backgroundColor: scheduleColors.bookBtnBg,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bookBtnPressed: {
    opacity: 0.92,
  },
  bookBtnDisabled: {
    opacity: 0.45,
  },
  bookBtnLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: scheduleColors.bookBtnText,
  },
});
