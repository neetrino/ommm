import { StyleSheet, Text, View } from "react-native";
import type { WaitlistItem } from "../../../lib/mocks/homeMock";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

type WaitlistSectionProps = {
  items: WaitlistItem[];
};

export function WaitlistSection({ items }: WaitlistSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Waitlist</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <View
            key={item.id}
            style={[
              styles.card,
              item.variant === "light" ? styles.cardLight : styles.cardDark,
            ]}
            accessibilityLabel={`${item.title} waitlist ${item.spotLabel}`}
          >
            <Text
              style={[
                styles.spotLabel,
                item.variant === "light"
                  ? styles.spotLabelLight
                  : styles.spotLabelDark,
              ]}
            >
              {item.spotLabel}
            </Text>
            <Text
              style={[
                styles.cardTitle,
                item.variant === "light"
                  ? styles.cardTitleLight
                  : styles.cardTitleDark,
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text
              style={[
                styles.schedule,
                item.variant === "light"
                  ? styles.scheduleLight
                  : styles.scheduleDark,
              ]}
              numberOfLines={1}
            >
              {item.scheduleLabel}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: space.screenHorizontal,
    marginBottom: space.section,
    gap: space.section,
  },
  title: {
    fontFamily: fontFamilies.newsreader.semiBoldItalic,
    fontSize: typography.sectionTitle,
    lineHeight: 24,
    color: colors.primaryGreen,
  },
  grid: {
    flexDirection: "row",
    gap: space.md,
  },
  card: {
    flex: 1,
    minWidth: 0,
    padding: space.lg,
    gap: 4.5,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardLight: {
    backgroundColor: colors.overlayWhite38,
    borderColor: colors.glassBorder,
    borderTopLeftRadius: radii.waitTopLeft,
    borderTopRightRadius: radii.waitTopRight,
    borderBottomLeftRadius: radii.waitTopLeft,
    borderBottomRightRadius: radii.waitTopRight,
  },
  cardDark: {
    backgroundColor: colors.overlayBlack08,
    borderColor: "transparent",
    borderTopLeftRadius: radii.waitTopRight,
    borderTopRightRadius: radii.waitTopLeft,
    borderBottomLeftRadius: radii.waitTopRight,
    borderBottomRightRadius: radii.waitTopLeft,
  },
  spotLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.micro,
    lineHeight: 15,
    textTransform: "uppercase",
  },
  spotLabelLight: {
    color: colors.primaryGreen,
  },
  spotLabelDark: {
    color: "rgba(255,255,255,0.84)",
  },
  cardTitle: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    lineHeight: 20,
  },
  cardTitleLight: {
    color: colors.ink,
  },
  cardTitleDark: {
    color: colors.white,
  },
  schedule: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.caption,
    lineHeight: 16,
    marginTop: 3.5,
  },
  scheduleLight: {
    color: colors.bodyMuted,
  },
  scheduleDark: {
    color: colors.bodyMutedOnDark,
  },
});
