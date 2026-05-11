import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { figmaRemoteAssets } from "../../../assets/figmaRemoteAssets";
import { fontFamilies } from "../../../theme/fontFamilies";
import {
  colors,
  giftCard,
  radii,
  space,
  typography,
} from "../../../theme/tokens";

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

      <View style={styles.badge} pointerEvents="none">
        <Image
          source={{ uri: figmaRemoteAssets.giftCardBadge }}
          style={styles.badgeImage}
          contentFit="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: space.screenHorizontal,
    paddingBottom: space.xl,
  },
  card: {
    borderRadius: radii.banner,
    overflow: "hidden",
    minHeight: giftCard.minHeight,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayGreen20,
    alignItems: "center",
    paddingHorizontal: giftCard.overlayPaddingHorizontal,
    paddingBottom: giftCard.overlayPaddingBottom,
  },
  badge: {
    position: "absolute",
    top: giftCard.badgeTop,
    left: "50%",
    marginLeft: -giftCard.badgeSize / 2,
    width: giftCard.badgeSize,
    height: giftCard.badgeSize,
    borderRadius: giftCard.badgeSize / 2,
    overflow: "hidden",
  },
  badgeImage: {
    width: "100%",
    height: "100%",
  },
  title: {
    textAlign: "center",
    marginTop: giftCard.titleTopOffset,
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
    marginTop: giftCard.subtitleMarginTop,
    maxWidth: giftCard.subtitleMaxWidth,
    minHeight: giftCard.subtitleMinHeight,
    paddingHorizontal: giftCard.subtitleInnerPaddingHorizontal,
    justifyContent: "center",
  },
  subtitle: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    lineHeight: 24,
    textAlign: "center",
    color: colors.white90,
  },
  cta: {
    marginTop: giftCard.ctaMarginTop,
    minHeight: giftCard.ctaMinHeight,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingHorizontal: giftCard.ctaPaddingHorizontal,
    paddingVertical: giftCard.ctaPaddingVertical,
    borderRadius: giftCard.ctaBorderRadius,
  },
  ctaPressed: {
    opacity: 0.94,
  },
  ctaLabel: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    lineHeight: 24,
    letterSpacing: giftCard.ctaLetterSpacing,
    textTransform: "uppercase",
    color: colors.primaryGreen,
    textAlign: "center",
  },
});
