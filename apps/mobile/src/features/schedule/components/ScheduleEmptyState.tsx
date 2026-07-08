import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { SCHEDULE_EMPTY_GRADIENT } from "../../../lib/schedule/schedulePageTokens";
import { fontFamilies } from "../../../theme/fontFamilies";
import { scheduleCopy } from "../scheduleCopy";
import { scheduleColors, scheduleLayout } from "../scheduleTokens";

export function ScheduleEmptyState() {
  return (
    <View style={styles.outer}>
      <LinearGradient
        colors={[...SCHEDULE_EMPTY_GRADIENT.colors]}
        start={SCHEDULE_EMPTY_GRADIENT.start}
        end={SCHEDULE_EMPTY_GRADIENT.end}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.title}>{scheduleCopy.emptyTitle}</Text>
      <Text style={styles.body}>{scheduleCopy.emptyBody}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    overflow: "hidden",
    borderRadius: scheduleLayout.emptyRadius,
    borderWidth: 1,
    borderColor: scheduleColors.rowBorder,
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignItems: "center",
    shadowColor: "#2d2823",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 2,
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
