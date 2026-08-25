import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getApiBaseUrl } from "../../../lib/api/config";
import { resolveApiAssetUrl } from "../../../lib/api/assetUrl";
import type { GiftMarketCard } from "../../../lib/api/giftCardsClient";
import { formatAmdFromCents } from "../../../lib/formatAmd";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

type GiftMarketCardTileProps = {
  card: GiftMarketCard;
  availableLabel: string;
  onPress: () => void;
  disabled?: boolean;
};

export function GiftMarketCardTile({
  card,
  availableLabel,
  onPress,
  disabled = false,
}: GiftMarketCardTileProps) {
  const imageUri = resolveApiAssetUrl(getApiBaseUrl(), card.imageUrl);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || card.availableQuantity <= 0}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
        (disabled || card.availableQuantity <= 0) && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={formatAmdFromCents(card.amountCents)}
    >
      {imageUri !== null ? (
        <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={styles.imageFallback} />
      )}
      <Text style={styles.amount}>{formatAmdFromCents(card.amountCents)}</Text>
      <Text style={styles.meta}>
        {availableLabel.replace("{available}", String(card.availableQuantity))}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.labelCard,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.white,
    overflow: "hidden",
    paddingBottom: space.md,
    gap: space.sm,
  },
  pressed: {
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.5,
  },
  image: {
    width: "100%",
    height: 140,
    backgroundColor: colors.overlayWhite35,
  },
  imageFallback: {
    width: "100%",
    height: 140,
    backgroundColor: colors.taupe,
    opacity: 0.35,
  },
  amount: {
    paddingHorizontal: space.md,
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
    fontSize: typography.sectionTitle,
    color: colors.primaryGreen,
  },
  meta: {
    paddingHorizontal: space.md,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.bodyMuted,
  },
});
