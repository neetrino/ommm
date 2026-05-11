import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { figmaRemoteAssets } from "../../../assets/figmaRemoteAssets";
import { fontFamilies } from "../../../theme/fontFamilies";
import {
  colors,
  layout,
  radii,
  shadows,
  space,
  typography,
} from "../../../theme/tokens";

export type NextClassContent = {
  title: string;
  badge: string;
  timeLocation: string;
  instructor: string;
  durationLabel: string;
  spotsLabel: string;
  statusLabel: string;
};

type NextClassSectionProps = {
  content: NextClassContent;
  onAllEventsPress?: () => void;
  onOpenClassPress?: () => void;
};

export function NextClassSection({
  content,
  onAllEventsPress,
  onOpenClassPress,
}: NextClassSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Next Class</Text>
        <Pressable
          onPress={onAllEventsPress}
          accessibilityRole="button"
          accessibilityLabel="View all events"
        >
          <Text style={styles.allEvents}>ALL EVENTS</Text>
        </Pressable>
      </View>

      <View style={styles.cardStage}>
        <View style={styles.backCardTilt} pointerEvents="none">
          <View style={styles.backCard} />
        </View>

        <View style={[styles.mainCard, shadows.bookingCard]}>
          <Image
            source={figmaRemoteAssets.bookingHero}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            accessibilityIgnoresInvertColors
          />
          <View style={styles.cardScrim} pointerEvents="none" />

          <View style={styles.comingBadge}>
            <Text style={styles.comingBadgeText}>{content.badge}</Text>
          </View>

          <View style={styles.cardTopRow}>
            <Text style={styles.classTitle} numberOfLines={2}>
              {content.title}
            </Text>
            <Pressable
              onPress={onOpenClassPress}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Open class details"
            >
              <Image
                source={figmaRemoteAssets.iconArrowOut}
                style={styles.arrowIcon}
                contentFit="contain"
              />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.detailsOverlap}>
        <View style={styles.detailsGlassFrame}>
          <BlurView
            intensity={NEXT_CLASS_DETAILS_BLUR_INTENSITY}
            tint="light"
            style={styles.detailsBlur}
          >
            <LinearGradient
              pointerEvents="none"
              colors={[
                NEXT_CLASS_GLASS_SHEEN_PEAK,
                NEXT_CLASS_GLASS_SHEEN_MID,
                NEXT_CLASS_GLASS_SHEEN_FLOOR,
                "transparent",
              ]}
              locations={[0, 0.05, 0.14, 0.32]}
              start={{ x: 0.02, y: 0.02 }}
              end={{ x: 0.48, y: 0.38 }}
              style={styles.detailsGlassSheen}
            />
            <LinearGradient
              pointerEvents="none"
              colors={[
                NEXT_CLASS_GLASS_TOP_GLOW,
                NEXT_CLASS_GLASS_TOP_GLOW_MID,
                "transparent",
              ]}
              locations={[0, 0.1, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.detailsGlassTopBand}
            />
            <LinearGradient
              pointerEvents="none"
              colors={[
                NEXT_CLASS_GLASS_DIAG_GLEAM,
                NEXT_CLASS_GLASS_DIAG_GLEAM_MID,
                "transparent",
                "transparent",
              ]}
              locations={[0, 0.07, 0.22, 0.45]}
              start={{ x: 0.08, y: 0.12 }}
              end={{ x: 0.92, y: 0.78 }}
              style={styles.detailsGlassDiagonalGleam}
            />
            <LinearGradient
              pointerEvents="none"
              colors={[
                NEXT_CLASS_GLASS_HOT_SPOT,
                "transparent",
              ]}
              locations={[0, 0.32]}
              start={{ x: 0.22, y: 0.08 }}
              end={{ x: 0.55, y: 0.35 }}
              style={styles.detailsGlassHotSpot}
            />
            <LinearGradient
              pointerEvents="none"
              colors={[
                "transparent",
                NEXT_CLASS_GLASS_CORNER_FLARE,
                NEXT_CLASS_GLASS_CORNER_FLARE_SOFT,
              ]}
              locations={[0.62, 0.88, 1]}
              start={{ x: 0.35, y: 0.4 }}
              end={{ x: 1, y: 1 }}
              style={styles.detailsGlassCornerFlare}
            />
            <LinearGradient
              pointerEvents="none"
              colors={[NEXT_CLASS_GLASS_TOP_EDGE_FLARE, "transparent"]}
              locations={[0, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.detailsGlassTopEdgeFlare}
            />
            <View style={styles.detailsInner}>
              <View style={styles.detailsTopRow}>
                <View style={styles.detailsTextCol}>
                  <Text style={styles.timeText} numberOfLines={2}>
                    {content.timeLocation}
                  </Text>
                  <Text style={styles.instructorText} numberOfLines={2}>
                    {content.instructor}
                  </Text>
                </View>
                <LinearGradient
                  colors={[colors.statusGradientStart, colors.statusGradientEnd]}
                  start={{ x: 0.1, y: 0.1 }}
                  end={{ x: 0.9, y: 0.9 }}
                  style={styles.statusPill}
                >
                  <Text style={styles.statusText}>{content.statusLabel}</Text>
                </LinearGradient>
              </View>

              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.05)", "transparent"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.divider}
              />

              <View style={styles.detailsFooter}>
                <Text style={styles.metaText}>{content.durationLabel}</Text>
                <View style={styles.spotsRow}>
                  <View style={styles.spotDot} />
                  <Text style={styles.metaText}>{content.spotsLabel}</Text>
                </View>
              </View>
            </View>
          </BlurView>
        </View>
      </View>
    </View>
  );
}

const CARD_HEIGHT = layout.bookingCardHeight;

/**
 * Draw frosted details further onto the hero image without changing layout
 * (siblings keep their positions) or shrinking inner padding.
 */
const NEXT_CLASS_DETAILS_OVER_IMAGE =
  space.xxl + space.md + space.sm + space.xs;

/**
 * Extra top padding only — draws the frosted panel onto the hero; bottom stays
 * tighter so overall height trims from below.
 */
const NEXT_CLASS_DETAILS_EXTRA_VERTICAL_TOP = space.md;

/** Blur without heavy milkiness — pair with low `backgroundColor` for clear glass. */
const NEXT_CLASS_DETAILS_BLUR_INTENSITY = 14;

/** Horizontal inset of frosted panel inside the card; lower = slightly wider glass. */
const NEXT_CLASS_DETAILS_SIDE_INSET = 0;

/**
 * Tight specular highlights only (no full-panel white wash) — reads shiny + transparent.
 */
const NEXT_CLASS_GLASS_BASE_TINT = "rgba(255,255,255,0.02)" as const;
const NEXT_CLASS_GLASS_SHEEN_PEAK = "rgba(255,255,255,0.72)" as const;
const NEXT_CLASS_GLASS_SHEEN_MID = "rgba(255,255,255,0.14)" as const;
const NEXT_CLASS_GLASS_SHEEN_FLOOR = "rgba(255,255,255,0.015)" as const;
const NEXT_CLASS_GLASS_TOP_GLOW = "rgba(255,255,255,0.26)" as const;
const NEXT_CLASS_GLASS_TOP_GLOW_MID = "rgba(255,255,255,0.05)" as const;
const NEXT_CLASS_GLASS_DIAG_GLEAM = "rgba(255,255,255,0.26)" as const;
const NEXT_CLASS_GLASS_DIAG_GLEAM_MID = "rgba(255,255,255,0.05)" as const;
const NEXT_CLASS_GLASS_HOT_SPOT = "rgba(255,255,255,0.4)" as const;
const NEXT_CLASS_GLASS_CORNER_FLARE = "rgba(255,255,255,0.17)" as const;
const NEXT_CLASS_GLASS_CORNER_FLARE_SOFT = "rgba(255,255,255,0.03)" as const;
const NEXT_CLASS_GLASS_TOP_EDGE_FLARE = "rgba(255,255,255,0.82)" as const;
const NEXT_CLASS_GLASS_RIM = "rgba(255,255,255,0.56)" as const;

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: space.screenHorizontal,
    marginBottom: space.section,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.section,
  },
  sectionTitle: {
    fontFamily: fontFamilies.newsreader.semiBoldItalic,
    fontSize: typography.sectionTitle,
    lineHeight: 24,
    color: colors.primaryGreen80,
  },
  allEvents: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.warmBrown,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  cardStage: {
    height: CARD_HEIGHT + 29,
    marginBottom: -space.xl,
  },
  backCardTilt: {
    position: "absolute",
    left: "5%",
    right: "5%",
    top: space.sm,
    height: CARD_HEIGHT - 22,
    transform: [{ rotate: "2deg" }],
    alignItems: "center",
    justifyContent: "center",
  },
  backCard: {
    width: "100%",
    height: "100%",
    borderRadius: radii.card,
    backgroundColor: colors.cardTint,
  },
  mainCard: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 29,
    borderRadius: radii.card,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.white,
  },
  cardScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.scrimDark,
    opacity: 0.15,
  },
  comingBadge: {
    position: "absolute",
    top: space.sm + 8,
    left: space.lg + 3,
    backgroundColor: colors.badgeCream,
    paddingHorizontal: space.sm,
    paddingVertical: 4.5,
    borderRadius: radii.pill,
  },
  comingBadgeText: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.caption,
    lineHeight: 16,
    color: colors.warmBrown,
    textTransform: "uppercase",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: space.xl,
    paddingTop: 62,
  },
  classTitle: {
    flex: 1,
    marginRight: space.sm,
    fontFamily: fontFamilies.newsreader.regular,
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.white,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonPressed: {
    opacity: 0.9,
  },
  arrowIcon: {
    width: 14,
    height: 14,
  },
  detailsOverlap: {
    marginTop: -space.xl,
    paddingHorizontal: NEXT_CLASS_DETAILS_SIDE_INSET,
    zIndex: 2,
    transform: [{ translateY: -NEXT_CLASS_DETAILS_OVER_IMAGE }],
  },
  detailsGlassFrame: {
    borderRadius: radii.card - 3,
    ...Platform.select({
      ios: {
        shadowColor: "#e8f0fa",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.42,
        shadowRadius: 14,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  detailsBlur: {
    borderRadius: radii.card - 3,
    overflow: "hidden",
    backgroundColor: NEXT_CLASS_GLASS_BASE_TINT,
    borderWidth: 1,
    borderColor: NEXT_CLASS_GLASS_RIM,
  },
  detailsGlassSheen: {
    ...StyleSheet.absoluteFillObject,
  },
  detailsGlassTopBand: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "24%",
  },
  detailsGlassDiagonalGleam: {
    ...StyleSheet.absoluteFillObject,
  },
  detailsGlassHotSpot: {
    ...StyleSheet.absoluteFillObject,
  },
  detailsGlassCornerFlare: {
    ...StyleSheet.absoluteFillObject,
  },
  detailsGlassTopEdgeFlare: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 4,
  },
  detailsInner: {
    position: "relative",
    zIndex: 1,
    paddingHorizontal: space.lg - 1,
    paddingTop: space.lg + 1 + NEXT_CLASS_DETAILS_EXTRA_VERTICAL_TOP,
    paddingBottom: space.md,
    gap: space.sm + 4,
  },
  detailsTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.md,
  },
  detailsTextCol: {
    flex: 1,
    minWidth: 0,
    gap: space.xs + 4,
  },
  timeText: {
    fontFamily: fontFamilies.montserrat.regular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    color: colors.black,
  },
  instructorText: {
    fontFamily: fontFamilies.montserrat.light,
    fontSize: typography.caption,
    lineHeight: 16,
    color: colors.black,
  },
  statusPill: {
    borderRadius: radii.pill,
    paddingHorizontal: space.sm + 4,
    paddingVertical: space.xs - 1,
    flexShrink: 0,
  },
  statusText: {
    fontFamily: fontFamilies.montserrat.regular,
    fontSize: typography.caption,
    lineHeight: 16,
    color: colors.black,
  },
  divider: {
    height: 1,
    width: "100%",
    opacity: 0.9,
  },
  detailsFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaText: {
    fontFamily: fontFamilies.montserrat.light,
    fontSize: typography.caption,
    lineHeight: 16,
    color: colors.black,
  },
  spotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  spotDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.black,
  },
});
