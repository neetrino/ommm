import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { figmaRemoteAssets } from "../../../assets/figmaRemoteAssets";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

type GiftCardContent = {
  titleLead: string;
  titleAccent: string;
  subtitleLines: readonly string[];
  ctaLabel: string;
};

type GiftCardSectionProps = {
  content: GiftCardContent;
  onBuyPress?: () => void;
};

export function GiftCardSection({ content, onBuyPress }: GiftCardSectionProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <LinearGradient
          colors={[colors.giftGradientStart, colors.giftGradientEnd]}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View style={styles.overlay}>
          <View style={styles.badge}>
            <Image
              source={{ uri: figmaRemoteAssets.brandMark }}
              style={styles.badgeImage}
              contentFit="cover"
            />
          </View>

          <Text style={styles.title} accessibilityRole="header">
            <Text style={styles.titlePlain}>{content.titleLead}</Text>
            <Text style={styles.titleAccent}>{content.titleAccent}</Text>
          </Text>

          <View style={styles.subtitleBlock}>
            {content.subtitleLines.map((line) => (
              <Text key={line} style={styles.subtitle}>
                {line}
              </Text>
            ))}
          </View>

          <Pressable
            onPress={onBuyPress}
            style={({ pressed }) => [
              styles.cta,
              pressed && styles.ctaPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={content.ctaLabel}
          >
            <Text style={styles.ctaLabel}>{content.ctaLabel}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const BADGE = 57;

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: space.screenHorizontal,
    paddingBottom: space.xl,
  },
  card: {
    borderRadius: radii.banner,
    overflow: "hidden",
    minHeight: 256,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayGreen20,
    alignItems: "center",
    paddingHorizontal: space.lg,
    paddingTop: BADGE + space.sm,
    paddingBottom: space.xl,
    gap: space.md,
  },
  badge: {
    position: "absolute",
    top: space.sm + 2,
    width: BADGE,
    height: BADGE,
    borderRadius: radii.logo,
    overflow: "hidden",
  },
  badgeImage: {
    width: "100%",
    height: "100%",
  },
  title: {
    textAlign: "center",
    marginTop: space.md,
  },
  titlePlain: {
    fontFamily: fontFamilies.newsreader.regular,
    fontSize: typography.body,
    lineHeight: 20,
    color: colors.white,
  },
  titleAccent: {
    fontFamily: fontFamilies.newsreader.lightItalic,
    fontSize: typography.body,
    lineHeight: 20,
    color: colors.white,
  },
  subtitleBlock: {
    alignItems: "center",
    maxWidth: 320,
    paddingHorizontal: 2,
  },
  subtitle: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    lineHeight: 24,
    textAlign: "center",
    color: "rgba(255,255,255,0.9)",
  },
  cta: {
    marginTop: space.sm,
    backgroundColor: colors.white,
    paddingHorizontal: space.xl + 8,
    paddingVertical: space.md,
    borderRadius: 60,
  },
  ctaPressed: {
    opacity: 0.94,
  },
  ctaLabel: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    lineHeight: 24,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: colors.primaryGreen,
    textAlign: "center",
  },
});
