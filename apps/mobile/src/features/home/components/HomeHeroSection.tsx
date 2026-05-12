import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { figmaRemoteAssets } from "../../../assets/figmaRemoteAssets";
import { AuthPillButtonStack } from "../../../features/auth/components/AuthPillButtonStack";
import { fontFamilies } from "../../../theme/fontFamilies";
import { homeMarketingCopy } from "../content/homeMarketingCopy";
import {
  colors,
  radii,
  shadows,
  space,
  typography,
} from "../../../theme/tokens";

const HERO_IMAGE_RADIUS = 40;
const BLUR_SIZE = 288;
const DISPLAY_FONT_SIZE = 34;
const DISPLAY_LINE_HEIGHT = 38;
const EYEBROW_TRACKING = 2.8;

type HomeHeroSectionProps = {
  isSignedIn: boolean;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
  onPreviewPress: () => void;
};

export function HomeHeroSection({
  isSignedIn,
  onPrimaryPress,
  onSecondaryPress,
  onPreviewPress,
}: HomeHeroSectionProps) {
  const { width } = useWindowDimensions();
  const horizontalPad = space.screenHorizontal;
  const imageMaxWidth = Math.min(width - horizontalPad * 2, layoutMaxImageWidth(width));

  const primaryLabel = isSignedIn
    ? homeMarketingCopy.hero.primaryCtaSignedIn
    : homeMarketingCopy.hero.primaryCtaSignedOut;

  return (
    <View style={[styles.section, { paddingHorizontal: horizontalPad }]}>
      <View style={styles.glowLayer} pointerEvents="none">
        <View style={[styles.glowOrb, styles.glowOrbLeft]} />
        <View style={[styles.glowOrb, styles.glowOrbRight]} />
      </View>

      <Text style={styles.eyebrow}>{homeMarketingCopy.hero.eyebrow}</Text>

      <Text style={styles.display}>
        {homeMarketingCopy.hero.titleLine1}{" "}
        <Text style={styles.displayItalic}>{homeMarketingCopy.hero.titleAccent}</Text>
      </Text>

      <Text style={styles.lead}>{homeMarketingCopy.hero.lead}</Text>

      {isSignedIn ? (
        <View style={styles.ctaRow}>
          <Pressable
            onPress={onPrimaryPress}
            style={({ pressed }) => [styles.ctaPrimary, pressed && styles.ctaPressed]}
            accessibilityRole="button"
            accessibilityLabel={primaryLabel}
          >
            <Text style={styles.ctaPrimaryLabel}>{primaryLabel}</Text>
          </Pressable>
          <Pressable
            onPress={onSecondaryPress}
            style={({ pressed }) => [styles.ctaGhost, pressed && styles.ctaPressed]}
            accessibilityRole="button"
            accessibilityLabel={homeMarketingCopy.hero.secondaryCta}
          >
            <Text style={styles.ctaGhostLabel}>{homeMarketingCopy.hero.secondaryCta}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.guestAuthCtas}>
          <AuthPillButtonStack
            onSignInPress={onPrimaryPress}
            onCreateAccountPress={onSecondaryPress}
          />
        </View>
      )}

      <Text style={styles.footnote}>
        {isSignedIn
          ? homeMarketingCopy.hero.footnote
          : homeMarketingCopy.hero.footnoteSignedOut}
      </Text>

      <Pressable
        onPress={onPreviewPress}
        style={({ pressed }) => [
          styles.previewCard,
          { maxWidth: imageMaxWidth, alignSelf: "center" },
          pressed && styles.ctaPressed,
          shadows.exploreHero,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${homeMarketingCopy.hero.previewTitle}. ${homeMarketingCopy.hero.previewCta}`}
      >
        <View style={styles.previewImageWrap}>
          <Image
            source={figmaRemoteAssets.exploreFeatured}
            style={styles.previewImage}
            contentFit="cover"
            accessibilityIgnoresInvertColors
          />
          <LinearGradient
            pointerEvents="none"
            colors={["transparent", "rgba(51,69,55,0.2)", "rgba(30,40,34,0.82)"]}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.previewCopy}>
            <Text style={styles.previewEyebrow}>{homeMarketingCopy.hero.previewEyebrow}</Text>
            <Text style={styles.previewTitle}>{homeMarketingCopy.hero.previewTitle}</Text>
            <Text style={styles.previewCta}>
              {homeMarketingCopy.hero.previewCta}
              <Text style={styles.previewArrow}> →</Text>
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

function layoutMaxImageWidth(screenWidth: number): number {
  if (screenWidth >= 420) {
    return 360;
  }
  return 320;
}

const styles = StyleSheet.create({
  section: {
    paddingBottom: space.xl,
    gap: space.md,
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  glowOrb: {
    position: "absolute",
    width: BLUR_SIZE,
    height: BLUR_SIZE,
    borderRadius: BLUR_SIZE / 2,
  },
  glowOrbLeft: {
    left: -96,
    top: 24,
    backgroundColor: "rgba(255,254,240,0.45)",
  },
  glowOrbRight: {
    right: -72,
    top: "42%",
    backgroundColor: "rgba(219,234,254,0.55)",
  },
  eyebrow: {
    marginTop: space.sm,
    fontFamily: fontFamilies.montserrat.bold,
    fontSize: typography.caption,
    letterSpacing: EYEBROW_TRACKING,
    textTransform: "uppercase",
    color: colors.taupe,
  },
  display: {
    marginTop: space.sm,
    fontFamily: fontFamilies.newsreader.semiBold,
    fontSize: DISPLAY_FONT_SIZE,
    lineHeight: DISPLAY_LINE_HEIGHT,
    color: colors.primaryGreen,
    maxWidth: 280,
  },
  displayItalic: {
    fontFamily: fontFamilies.newsreader.semiBoldItalic,
  },
  lead: {
    marginTop: space.sm,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.secondarySage,
    maxWidth: 520,
  },
  guestAuthCtas: {
    marginTop: space.lg,
    width: "100%",
  },
  ctaRow: {
    marginTop: space.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    alignItems: "center",
  },
  ctaPrimary: {
    backgroundColor: colors.primaryGreen,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm + 2,
    borderRadius: radii.pill,
    minHeight: 48,
    justifyContent: "center",
  },
  ctaPrimaryLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.white,
  },
  ctaGhost: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.overlayGreen20,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm + 2,
    borderRadius: radii.pill,
    backgroundColor: colors.overlayWhite20,
    minHeight: 48,
    justifyContent: "center",
  },
  ctaGhostLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.primaryGreen,
  },
  ctaPressed: {
    opacity: 0.88,
  },
  footnote: {
    marginTop: space.xs,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.caption,
    lineHeight: 18,
    color: colors.bodyMuted,
    maxWidth: 520,
  },
  previewCard: {
    marginTop: space.lg,
    width: "100%",
    borderRadius: HERO_IMAGE_RADIUS,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  previewImageWrap: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: colors.primaryGreen,
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
  },
  previewCopy: {
    position: "absolute",
    left: space.lg,
    right: space.lg,
    bottom: space.lg,
  },
  previewEyebrow: {
    fontFamily: fontFamilies.montserrat.bold,
    fontSize: typography.caption,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: "rgba(255,254,240,0.88)",
  },
  previewTitle: {
    marginTop: space.sm,
    fontFamily: fontFamilies.newsreader.semiBold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.white,
  },
  previewCta: {
    marginTop: space.sm,
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: "rgba(255,255,255,0.92)",
  },
  previewArrow: {
    fontFamily: fontFamilies.manrope.semiBold,
  },
});
