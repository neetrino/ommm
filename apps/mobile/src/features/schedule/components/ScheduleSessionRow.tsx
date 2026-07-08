import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ClassSessionRow } from "../../../lib/api/memberClient";
import { SCHEDULE_PAGE_MOBILE } from "../../../lib/schedule/schedulePageTokens";
import { resolveScheduleRowGradientColors } from "../../../lib/schedule/scheduleRowGradients";
import { fontFamilies } from "../../../theme/fontFamilies";
import { formatScheduleTimeHHmm, scheduleCopy } from "../scheduleCopy";
import { scheduleColors, scheduleLayout } from "../scheduleTokens";

type ScheduleSessionRowProps = {
  session: ClassSessionRow;
  locale: string;
  onBookPress: (session: ClassSessionRow) => void;
  booking?: boolean;
};

function isSessionFull(session: ClassSessionRow): boolean {
  return session.status === "FULL" || session._count.bookings >= session.capacity;
}

export function ScheduleSessionRow({
  session,
  locale,
  onBookPress,
  booking = false,
}: ScheduleSessionRowProps) {
  const coach = session.coach.user.name?.trim() || "Coach";
  const classType = session.classType.name.trim();
  const timeLabel = formatScheduleTimeHHmm(session.startsAt, locale);
  const durationLabel = scheduleCopy.minutesShort(
    Math.max(
      1,
      Math.round(
        (new Date(session.endsAt).getTime() - new Date(session.startsAt).getTime()) / 60000,
      ),
    ),
  );
  const spotsLeft = Math.max(session.capacity - session._count.bookings, 0);
  const full = isSessionFull(session);
  const spotsUrgent = !full && spotsLeft <= SCHEDULE_PAGE_MOBILE.spotsUrgentThreshold;
  const gradientColors = resolveScheduleRowGradientColors(classType);

  return (
    <View style={styles.rowOuter}>
      <LinearGradient
        colors={[gradientColors[0], gradientColors[1]]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.row}>
        <View style={styles.timeCol}>
          <Text style={styles.timeLabel}>{timeLabel}</Text>
          <Text style={styles.durationLabel}>{durationLabel}</Text>
        </View>

        <View style={styles.bodyCol}>
          <Text style={styles.classTitle}>{classType}</Text>
          <Text style={styles.subtitle}>
            {coach} • {classType}
          </Text>
          <Text style={[styles.spots, spotsUrgent && styles.spotsUrgent]}>
            {full ? scheduleCopy.spotsFull : scheduleCopy.spotsLeft(spotsLeft)}
          </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  rowOuter: {
    overflow: "hidden",
    borderRadius: scheduleLayout.rowRadius,
    borderWidth: 1,
    borderColor: scheduleColors.rowBorder,
    shadowColor: "#2d2823",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.13,
    shadowRadius: 28,
    elevation: 2,
  },
  row: {
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  timeCol: {
    minWidth: 0,
  },
  timeLabel: {
    fontFamily: fontFamilies.manrope.bold,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 0.34,
    color: scheduleColors.ink,
  },
  durationLabel: {
    marginTop: 4,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    textTransform: "uppercase",
    color: scheduleColors.muted,
  },
  bodyCol: {
    minWidth: 0,
  },
  classTitle: {
    fontFamily: fontFamilies.gtSuperDs.bold,
    fontSize: 17,
    lineHeight: 21,
    letterSpacing: -0.17,
    color: scheduleColors.ink,
  },
  subtitle: {
    marginTop: 6,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: 14,
    lineHeight: 20,
    color: scheduleColors.body,
  },
  spots: {
    marginTop: 6,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.26,
    color: scheduleColors.muted,
  },
  spotsUrgent: {
    color: scheduleColors.spotsUrgent,
  },
  bookBtn: {
    width: "100%",
    minHeight: scheduleLayout.bookBtnHeight,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: scheduleColors.bookBtnBorder,
    backgroundColor: scheduleColors.bookBtnBg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  bookBtnPressed: {
    opacity: 0.92,
  },
  bookBtnDisabled: {
    opacity: 0.45,
  },
  bookBtnLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: scheduleColors.bookBtnText,
  },
});
