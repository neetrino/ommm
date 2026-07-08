import { LinearGradient } from "expo-linear-gradient";
import { Platform, StyleSheet, Text, View } from "react-native";
import { SCHEDULE_EMPTY_GRADIENT } from "../../../lib/schedule/schedulePageTokens";
import { fontFamilies } from "../../../theme/fontFamilies";
import { useScheduleCopy } from "../useScheduleCopy";
import { scheduleColors, scheduleLayout } from "../scheduleTokens";

const CARD_RADIUS = scheduleLayout.emptyRadius;

export function ScheduleEmptyState() {
  const scheduleCopy = useScheduleCopy();

  return (
    <View style={styles.shadowShell}>
      <View style={styles.clipShell}>
        <LinearGradient
          colors={[...SCHEDULE_EMPTY_GRADIENT.colors]}
          start={SCHEDULE_EMPTY_GRADIENT.start}
          end={SCHEDULE_EMPTY_GRADIENT.end}
          style={styles.gradientFill}
        />
        <Text style={styles.title}>{scheduleCopy.emptyTitle}</Text>
        <Text style={styles.body}>{scheduleCopy.emptyBody}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowShell: {
    borderRadius: CARD_RADIUS,
    ...(Platform.OS === "android"
      ? { elevation: 2 }
      : {
          shadowColor: "#2d2823",
          shadowOffset: { width: 0, height: 18 },
          shadowOpacity: 0.12,
          shadowRadius: 28,
        }),
  },
  clipShell: {
    overflow: "hidden",
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: scheduleColors.rowBorder,
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignItems: "center",
  },
  gradientFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_RADIUS,
  },
  title: {
    fontFamily: fontFamilies.gtSuperDs.boldItalic,
    fontSize: 24,
    lineHeight: 27,
    letterSpacing: -0.48,
    color: scheduleColors.heading,
    textAlign: "center",
  },
  body: {
    marginTop: 14,
    maxWidth: 384,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: 15,
    lineHeight: 23,
    letterSpacing: 0.15,
    color: scheduleColors.muted,
    textAlign: "center",
  },
});
