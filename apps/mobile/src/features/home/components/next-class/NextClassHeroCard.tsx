import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { figmaRemoteAssets } from "../../../../assets/figmaRemoteAssets";
import { useIsCompactChrome } from "../../../../components/layout/useScreenChrome";
import { layout, shadows } from "../../../../theme/tokens";
import { nextClassStyles as styles } from "./nextClassStyles";
import type { NextClassContent } from "./nextClassTypes";
import { useMemberBookingCopy } from "../../../member/hooks/useMemberBookingCopy";

type NextClassHeroCardProps = {
  content: NextClassContent;
  onOpenClassPress?: () => void;
};

const CARD_STAGE_EXTRA = 29;
const BACK_CARD_SHRINK = 22;
const NEXT_CLASS_MAX_HEIGHT_RATIO = 0.48;
const NEXT_CLASS_COMPACT_MIN = 160;

export function NextClassHeroCard({
  content,
  onOpenClassPress,
}: NextClassHeroCardProps) {
  const bookingCopy = useMemberBookingCopy();
  const { height: windowHeight } = useWindowDimensions();
  const compact = useIsCompactChrome();
  const portraitCardHeight = layout.bookingCardHeight;
  const compactCardHeight = Math.max(
    NEXT_CLASS_COMPACT_MIN,
    Math.min(portraitCardHeight, windowHeight * NEXT_CLASS_MAX_HEIGHT_RATIO),
  );
  const cardHeight = compact ? compactCardHeight : portraitCardHeight;

  return (
    <View style={[styles.cardStage, { height: cardHeight + CARD_STAGE_EXTRA }]}>
      <View style={[styles.backCardTilt, { height: cardHeight - BACK_CARD_SHRINK }]}>
        <View style={styles.backCard} />
      </View>

      <View style={[styles.mainCard, shadows.bookingCard]}>
        <Image
          source={figmaRemoteAssets.bookingHero}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.cardScrim} />

        <View style={styles.comingBadge}>
          <Text style={styles.comingBadgeText}>{content.badge}</Text>
        </View>

        <Pressable
          onPress={onOpenClassPress}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={bookingCopy.nextClassOpenLabel}
        >
          <Image
            source={figmaRemoteAssets.iconArrowOut}
            style={styles.arrowIcon}
            contentFit="contain"
          />
        </Pressable>

        <View style={styles.cardTopRow}>
          <Text style={styles.classTitle} numberOfLines={2}>
            {content.title}
          </Text>
        </View>
      </View>
    </View>
  );
}
