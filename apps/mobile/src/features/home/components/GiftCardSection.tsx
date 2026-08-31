import { LinearGradient } from "expo-linear-gradient";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { HeaderSpinningSphere } from "../../../components/layout/HeaderSpinningSphere";
import { useIsCompactChrome } from "../../../components/layout/useScreenChrome";
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

const GIFT_CARD_COMPACT_SCALE = 0.72;

export function GiftCardSection({ content, onBuyPress }: GiftCardSectionProps) {
  const compact = useIsCompactChrome();
  const scale = compact ? GIFT_CARD_COMPACT_SCALE : 1;
  const badgeSlotSize = giftCard.badgeSize * scale;
  const sphereSize = giftCard.sphereSize * scale;
  const cardMinHeight = giftCard.minHeight * scale;
  const titleTopOffset = giftCard.titleTopOffset * scale;

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.card,
          compact ? { minHeight: cardMinHeight } : { height: giftCard.minHeight },
        ]}
      >
        <LinearGradient
          colors={[colors.giftGradientStart, colors.giftGradientEnd]}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View
          style={[
            compact ? styles.overlayFlow : styles.overlayFill,
            compact ? styles.overlayCompact : null,
          ]}
        >
          <Text
            style={[styles.title, { marginTop: titleTopOffset }]}
            accessibilityRole="header"
          >
            <Text style={styles.titlePlain}>{content.titleLead}</Text>
            <Text> </Text>
            <Text style={styles.titleAccent}>{content.titleAccent}</Text>
          </Text>

          <View style={styles.subtitleBlock}>
            {content.subtitleLines.map((line) => (
              <Text
                key={line}
                style={styles.subtitle}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
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

      <View
        style={[
          styles.badgeSlot,
          {
            top: giftCard.badgeTop * scale,
            height: badgeSlotSize,
          },
        ]}
        pointerEvents="none"
      >
        <HeaderSpinningSphere size={sphereSize} />
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
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayFill: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: colors.overlayGreen20,
    paddingHorizontal: giftCard.overlayPaddingHorizontal,
    paddingBottom: giftCard.overlayPaddingBottom,
  },
  overlayFlow: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: colors.overlayGreen20,
    paddingHorizontal: giftCard.overlayPaddingHorizontal,
    paddingBottom: giftCard.overlayPaddingBottom,
  },
  overlayCompact: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  /**
   * Full-width absolute slot — centers the sphere both axes to match how
   * the static logo-mark artboard sat inside the old 128 badge (cover crop).
   */
  badgeSlot: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
  },
  titlePlain: {
    fontFamily: fontFamilies.gtSuperDs.regular,
    fontSize: typography.body,
    lineHeight: 20,
    color: colors.white,
  },
  titleAccent: {
    fontFamily: fontFamilies.gtSuperDs.lightItalic,
    fontSize: typography.body,
    lineHeight: 20,
    color: colors.white,
  },
  subtitleBlock: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: giftCard.subtitleMarginTop,
    maxWidth: giftCard.subtitleMaxWidth,
    minHeight: giftCard.subtitleMinHeight,
    paddingHorizontal: giftCard.subtitleInnerPaddingHorizontal,
  },
  subtitle: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    textAlign: "center",
    color: colors.white90,
  },
  cta: {
    marginTop: "auto",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingHorizontal: giftCard.ctaPaddingHorizontal,
    paddingVertical: giftCard.ctaPaddingVertical,
    minHeight: giftCard.ctaMinHeight,
    borderRadius: giftCard.ctaBorderRadius,
  },
  ctaPressed: {
    opacity: 0.94,
  },
  ctaLabel: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    lineHeight: 22,
    letterSpacing: giftCard.ctaLetterSpacing,
    textTransform: "uppercase",
    color: colors.primaryGreen,
    textAlign: "center",
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
});
