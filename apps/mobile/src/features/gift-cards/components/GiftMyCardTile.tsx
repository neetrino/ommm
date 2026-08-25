import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { getApiBaseUrl } from "../../../lib/api/config";
import { resolveApiAssetUrl } from "../../../lib/api/assetUrl";
import type { UserGiftCardRow } from "../../../lib/api/giftCardsClient";
import { formatAmdFromCents } from "../../../lib/formatAmd";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

type GiftMyCardTileProps = {
  card: UserGiftCardRow;
  sourceLabel: string;
  balanceLabel: string;
  codeLabel: string;
  statusLabel: string;
};

export function GiftMyCardTile({
  card,
  sourceLabel,
  balanceLabel,
  codeLabel,
  statusLabel,
}: GiftMyCardTileProps) {
  const imageUri = resolveApiAssetUrl(getApiBaseUrl(), card.imageUrl);

  return (
    <View style={styles.card}>
      {imageUri !== null ? (
        <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={styles.imageFallback} />
      )}
      <View style={styles.body}>
        <Text style={styles.source}>{sourceLabel}</Text>
        <Text style={styles.amount}>{formatAmdFromCents(card.amountCents)}</Text>
        <Text style={styles.meta}>
          {balanceLabel}: {formatAmdFromCents(card.balanceCents)}
        </Text>
        <Text style={styles.meta}>
          {codeLabel}: {card.code}
        </Text>
        <Text style={styles.meta}>
          {statusLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.labelCard,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 120,
    backgroundColor: colors.overlayWhite35,
  },
  imageFallback: {
    width: "100%",
    height: 120,
    backgroundColor: colors.taupe,
    opacity: 0.35,
  },
  body: {
    gap: 4,
    padding: space.md,
  },
  source: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.bodyMuted,
  },
  amount: {
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
    fontSize: typography.sectionTitle,
    color: colors.primaryGreen,
  },
  meta: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.ink,
  },
});
