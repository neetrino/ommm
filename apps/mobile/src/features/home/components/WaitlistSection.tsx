import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, StyleSheet, Text, View } from "react-native";
import type { WaitlistItem } from "../../../lib/mocks/homeMock";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

type WaitlistSectionProps = {
  items: WaitlistItem[];
};

const WAITLIST_CARD_BLUR_INTENSITY = 24;

const WAITLIST_LIGHT_GLASS_BASE = "rgba(255,255,255,0.06)" as const;
const WAITLIST_LIGHT_SHEEN_PEAK = "rgba(255,255,255,0.9)" as const;
const WAITLIST_LIGHT_SHEEN_MID = "rgba(255,255,255,0.3)" as const;
const WAITLIST_LIGHT_SHEEN_FLOOR = "rgba(255,255,255,0.1)" as const;
const WAITLIST_LIGHT_TOP_GLOW = "rgba(255,255,255,0.52)" as const;
const WAITLIST_LIGHT_TOP_MID = "rgba(255,255,255,0.14)" as const;
const WAITLIST_LIGHT_DIAG = "rgba(255,255,255,0.34)" as const;
const WAITLIST_LIGHT_TOP_EDGE = "rgba(255,255,255,0.96)" as const;

const WAITLIST_DARK_GLASS_BASE = "rgba(14,18,24,0.44)" as const;
const WAITLIST_DARK_SHEEN_PEAK = "rgba(255,255,255,0.58)" as const;
const WAITLIST_DARK_SHEEN_MID = "rgba(255,255,255,0.22)" as const;
const WAITLIST_DARK_SHEEN_FLOOR = "rgba(255,255,255,0.1)" as const;
const WAITLIST_DARK_TOP_GLOW = "rgba(255,255,255,0.4)" as const;
const WAITLIST_DARK_TOP_MID = "rgba(255,255,255,0.12)" as const;
const WAITLIST_DARK_DIAG = "rgba(255,255,255,0.36)" as const;
const WAITLIST_DARK_TOP_EDGE = "rgba(255,255,255,0.78)" as const;
const WAITLIST_DARK_RIM = "rgba(255,255,255,0.68)" as const;

function WaitlistLightGlassOverlays() {
  return (
    <>
      <LinearGradient
        pointerEvents="none"
        colors={[
          WAITLIST_LIGHT_SHEEN_PEAK,
          WAITLIST_LIGHT_SHEEN_MID,
          WAITLIST_LIGHT_SHEEN_FLOOR,
          "transparent",
        ]}
        locations={[0, 0.05, 0.16, 0.4]}
        start={{ x: 0.02, y: 0.02 }}
        end={{ x: 0.5, y: 0.4 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[WAITLIST_LIGHT_DIAG, "transparent", "transparent"]}
        locations={[0, 0.16, 1]}
        start={{ x: 0.12, y: 0.12 }}
        end={{ x: 0.88, y: 0.72 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[
          WAITLIST_LIGHT_TOP_GLOW,
          WAITLIST_LIGHT_TOP_MID,
          "transparent",
        ]}
        locations={[0, 0.1, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.cardGlassTopBand}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[WAITLIST_LIGHT_TOP_EDGE, "transparent"]}
        locations={[0, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.cardGlassTopEdge}
      />
    </>
  );
}

function WaitlistDarkGlassOverlays() {
  return (
    <>
      <LinearGradient
        pointerEvents="none"
        colors={[
          WAITLIST_DARK_SHEEN_PEAK,
          WAITLIST_DARK_SHEEN_MID,
          WAITLIST_DARK_SHEEN_FLOOR,
          "transparent",
        ]}
        locations={[0, 0.06, 0.18, 0.44]}
        start={{ x: 0.02, y: 0.02 }}
        end={{ x: 0.52, y: 0.42 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[WAITLIST_DARK_TOP_GLOW, WAITLIST_DARK_TOP_MID, "transparent"]}
        locations={[0, 0.11, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.cardGlassTopBand}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[WAITLIST_DARK_DIAG, "transparent", "transparent"]}
        locations={[0, 0.14, 1]}
        start={{ x: 0.1, y: 0.15 }}
        end={{ x: 0.9, y: 0.75 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[WAITLIST_DARK_TOP_EDGE, "transparent"]}
        locations={[0, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.cardGlassTopEdge}
      />
    </>
  );
}

function WaitlistGlassCard({ item }: { item: WaitlistItem }) {
  const isLight = item.variant === "light";
  const radiusStyle = isLight ? styles.radiusLight : styles.radiusDark;

  return (
    <View
      style={[styles.cardFrame, radiusStyle]}
      accessibilityLabel={`${item.title} waitlist ${item.spotLabel}`}
    >
      <BlurView
        intensity={WAITLIST_CARD_BLUR_INTENSITY}
        tint={isLight ? "light" : "dark"}
        style={[
          styles.cardBlur,
          radiusStyle,
          isLight ? styles.cardBlurLight : styles.cardBlurDark,
        ]}
      >
        {isLight ? <WaitlistLightGlassOverlays /> : <WaitlistDarkGlassOverlays />}
        <View style={styles.cardInner}>
          <Text
            style={[
              styles.spotLabel,
              isLight ? styles.spotLabelLight : styles.spotLabelDark,
            ]}
          >
            {item.spotLabel}
          </Text>
          <Text
            style={[
              styles.cardTitle,
              isLight ? styles.cardTitleLight : styles.cardTitleDark,
            ]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.schedule,
              isLight ? styles.scheduleLight : styles.scheduleDark,
            ]}
            numberOfLines={1}
          >
            {item.scheduleLabel}
          </Text>
        </View>
      </BlurView>
    </View>
  );
}

export function WaitlistSection({ items }: WaitlistSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Waitlist</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <WaitlistGlassCard key={item.id} item={item} />
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
  cardFrame: {
    flex: 1,
    minWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#e8f0fc",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.48,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
      default: {},
    }),
  },
  radiusLight: {
    borderTopLeftRadius: radii.waitTopLeft,
    borderTopRightRadius: radii.waitTopRight,
    borderBottomLeftRadius: radii.waitTopLeft,
    borderBottomRightRadius: radii.waitTopRight,
  },
  radiusDark: {
    borderTopLeftRadius: radii.waitTopRight,
    borderTopRightRadius: radii.waitTopLeft,
    borderBottomLeftRadius: radii.waitTopRight,
    borderBottomRightRadius: radii.waitTopLeft,
  },
  cardBlur: {
    overflow: "hidden",
  },
  cardBlurLight: {
    backgroundColor: WAITLIST_LIGHT_GLASS_BASE,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
  },
  cardBlurDark: {
    backgroundColor: WAITLIST_DARK_GLASS_BASE,
    borderWidth: 1.5,
    borderColor: WAITLIST_DARK_RIM,
  },
  cardGlassTopBand: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "42%",
  },
  cardGlassTopEdge: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 4,
  },
  cardInner: {
    position: "relative",
    zIndex: 1,
    padding: space.lg,
    gap: 4.5,
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
    color: colors.bodyMuted,
  },
});
