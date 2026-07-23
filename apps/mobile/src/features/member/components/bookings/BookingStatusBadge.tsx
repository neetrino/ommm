import { StyleSheet, Text, View } from "react-native";
import {
  bookingStatusPalette,
  resolveBookingStatusTone,
} from "../../lib/bookingStatusTokens";
import { fontFamilies } from "../../../../theme/fontFamilies";
import { radii, typography } from "../../../../theme/tokens";

type BookingStatusBadgeProps = {
  status: string;
  label: string;
  isUpcoming: boolean;
};

export function BookingStatusBadge({
  status,
  label,
  isUpcoming,
}: BookingStatusBadgeProps) {
  const tone = resolveBookingStatusTone(status, isUpcoming);
  const palette = bookingStatusPalette(tone);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: palette.bg, borderColor: palette.border },
      ]}
      accessibilityRole="text"
    >
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  label: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.micro,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});
