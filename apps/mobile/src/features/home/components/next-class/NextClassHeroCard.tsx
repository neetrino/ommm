import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { figmaRemoteAssets } from "../../../../assets/figmaRemoteAssets";
import { shadows } from "../../../../theme/tokens";
import { nextClassStyles as styles } from "./nextClassStyles";
import type { NextClassContent } from "./nextClassTypes";
import { useMemberBookingCopy } from "../../../member/hooks/useMemberBookingCopy";

type NextClassHeroCardProps = {
  content: NextClassContent;
  onOpenClassPress?: () => void;
};

export function NextClassHeroCard({
  content,
  onOpenClassPress,
}: NextClassHeroCardProps) {
  const bookingCopy = useMemberBookingCopy();

  return (
    <View style={styles.cardStage}>
      <View style={styles.backCardTilt}>
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
            accessibilityLabel={bookingCopy.nextClassOpenLabel}
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
  );
}
