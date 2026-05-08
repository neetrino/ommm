import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { figmaRemoteAssets } from "../../../assets/figmaRemoteAssets";
import type { ExploreTileMock } from "../../../lib/mocks/homeMock";
import { fontFamilies } from "../../../theme/fontFamilies";
import {
  colors,
  gradients,
  radii,
  shadows,
  space,
  typography,
} from "../../../theme/tokens";

type ExploreSectionProps = {
  journalEyebrow: string;
  journalTitle: string;
  tiles: ExploreTileMock[];
  onPlayPress?: () => void;
};

function resolveTileUri(key: ExploreTileMock["imageUriKey"]): string {
  return key === "exploreRetreat"
    ? figmaRemoteAssets.exploreRetreat
    : figmaRemoteAssets.explorePilates;
}

export function ExploreSection({
  journalEyebrow,
  journalTitle,
  tiles,
  onPlayPress,
}: ExploreSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.titleWrap}>
        <Text style={styles.watermark} pointerEvents="none">
          News
        </Text>
        <Text style={styles.title}>Explore</Text>
      </View>

      <View style={styles.featured}>
        <View style={[styles.heroImageWrap, shadows.exploreHero]}>
          <Image
            source={{ uri: figmaRemoteAssets.exploreFeatured }}
            style={styles.heroImage}
            contentFit="cover"
            accessibilityLabel="Wellness journal feature"
          />
        </View>

        <View style={styles.labelCard}>
          <Image
            source={{ uri: figmaRemoteAssets.overlayGradient }}
            style={styles.labelGradient}
            contentFit="fill"
            pointerEvents="none"
          />
          <View style={styles.labelRow}>
            <View style={styles.labelTextCol}>
              <Text style={styles.eyebrow}>{journalEyebrow}</Text>
              <Text style={styles.journalTitle} numberOfLines={2}>
                {journalTitle}
              </Text>
            </View>
            <Pressable
              onPress={onPlayPress}
              style={({ pressed }) => [
                styles.playButton,
                pressed && styles.playButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Play wellness journal"
            >
              <LinearGradient
                colors={[...gradients.playButton.colors]}
                start={gradients.playButton.start}
                end={gradients.playButton.end}
                style={styles.playGradient}
              >
                <Image
                  source={{ uri: figmaRemoteAssets.iconPlay }}
                  style={styles.playIcon}
                  contentFit="contain"
                />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.tileGrid}>
        {tiles.map((tile) => (
          <View key={tile.id} style={styles.tileCol}>
            <View style={styles.tileImageWrap}>
              <Image
                source={{ uri: resolveTileUri(tile.imageUriKey) }}
                style={styles.tileImage}
                contentFit="cover"
              />
              <View
                style={[
                  styles.tileTag,
                  tile.tagVariant === "light"
                    ? styles.tileTagLight
                    : styles.tileTagDark,
                ]}
              >
                <Text
                  style={[
                    styles.tileTagText,
                    tile.tagVariant === "light"
                      ? styles.tileTagTextLight
                      : styles.tileTagTextDark,
                  ]}
                >
                  {tile.tag}
                </Text>
              </View>
            </View>
            <Text style={styles.tileTitle} numberOfLines={2}>
              {tile.title}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: space.screenHorizontal,
    marginBottom: space.section,
    gap: space.section + space.md,
  },
  titleWrap: {
    position: "relative",
    justifyContent: "flex-end",
    minHeight: 40,
  },
  watermark: {
    position: "absolute",
    right: -space.md,
    top: -space.xl,
    fontFamily: fontFamilies.newsreader.regularItalic,
    fontSize: typography.watermark,
    lineHeight: typography.watermark,
    color: colors.watermark,
  },
  title: {
    fontFamily: fontFamilies.newsreader.semiBoldItalic,
    fontSize: typography.sectionTitle,
    lineHeight: 24,
    color: colors.exploreTitle,
    zIndex: 1,
  },
  featured: {
    position: "relative",
    marginBottom: space.xl,
  },
  heroImageWrap: {
    width: "100%",
    aspectRatio: 16 / 11,
    borderRadius: radii.card,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  labelCard: {
    position: "absolute",
    left: space.lg,
    right: space.lg,
    bottom: -space.lg,
    borderRadius: radii.labelCard,
    backgroundColor: colors.overlayWhite40,
    padding: space.lg,
    overflow: "hidden",
  },
  labelGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
  },
  labelTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 0.5,
  },
  eyebrow: {
    fontFamily: fontFamilies.manrope.bold,
    fontSize: typography.caption,
    lineHeight: 16,
    letterSpacing: 1.2,
    color: colors.white,
    textTransform: "uppercase",
  },
  journalTitle: {
    fontFamily: fontFamilies.newsreader.regular,
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.white,
  },
  playButton: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.white,
    overflow: "hidden",
  },
  playButtonPressed: {
    opacity: 0.92,
  },
  playGradient: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    width: 8,
    height: 10,
  },
  tileGrid: {
    flexDirection: "row",
    gap: space.md,
    marginTop: space.xl,
    paddingTop: space.md,
  },
  tileCol: {
    flex: 1,
    minWidth: 0,
    gap: space.sm,
    alignItems: "stretch",
  },
  tileImageWrap: {
    borderRadius: radii.card,
    overflow: "hidden",
    width: "100%",
    aspectRatio: 1 / 1.15,
    backgroundColor: colors.white,
  },
  tileImage: {
    width: "100%",
    height: "100%",
  },
  tileTag: {
    position: "absolute",
    top: space.sm - 2,
    alignSelf: "center",
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs,
    borderRadius: radii.pill,
  },
  tileTagLight: {
    backgroundColor: colors.white,
  },
  tileTagDark: {
    backgroundColor: colors.studioPill,
  },
  tileTagText: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.micro,
    lineHeight: 15,
    textTransform: "uppercase",
  },
  tileTagTextLight: {
    color: colors.ink,
  },
  tileTagTextDark: {
    color: colors.white,
  },
  tileTitle: {
    fontFamily: fontFamilies.newsreader.semiBold,
    fontSize: typography.body,
    lineHeight: 20,
    color: colors.tileTitle,
    paddingHorizontal: space.xxs,
  },
});
