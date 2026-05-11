import { BlurView } from "expo-blur";
import { Image, type ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { exploreBundledAssets } from "../../../assets/exploreBundledAssets";
import { figmaRemoteAssets } from "../../../assets/figmaRemoteAssets";
import type { ExploreTileMock } from "../../../lib/mocks/homeMock";
import { fontFamilies } from "../../../theme/fontFamilies";
import {
  colors,
  exploreTile,
  radii,
  shadows,
  space,
  typography,
} from "../../../theme/tokens";

/** Frosted label over hero — reference: white type + light glass + rim highlight. */
const EXPLORE_JOURNAL_LABEL_BLUR_INTENSITY = 20;
const EXPLORE_JOURNAL_GLASS_BASE = "rgba(255,255,255,0.11)" as const;
const EXPLORE_JOURNAL_TOP_EDGE_SHEEN = "rgba(255,255,255,0.62)" as const;

type ExploreSectionProps = {
  journalEyebrow: string;
  journalTitle: string;
  tiles: ExploreTileMock[];
};

function resolveExploreImageSource(
  key: ExploreTileMock["imageUriKey"],
): ImageSource {
  return key === "explorePilates"
    ? exploreBundledAssets.pilates1_202
    : figmaRemoteAssets.exploreRetreat;
}

type ExploreTileColumnProps = {
  tile: ExploreTileMock;
  columnIndex: number;
  scale: number;
};

type ExploreTileTagRowProps = {
  tile: ExploreTileMock;
  scale: number;
  badgeTop: number;
  retreatLeadingInset: number;
};

function ExploreTileTagRow({
  tile,
  scale,
  badgeTop,
  retreatLeadingInset,
}: ExploreTileTagRowProps) {
  const tagRowCentered = tile.tagVariant === "dark";

  return (
    <View
      style={[
        styles.tileTagRow,
        { top: badgeTop },
        tagRowCentered
          ? styles.tileTagRowCentered
          : [styles.tileTagRowLeading, { paddingLeft: retreatLeadingInset }],
      ]}
      pointerEvents="none"
    >
      <View
        style={[
          styles.tileTag,
          tile.tagVariant === "light"
            ? styles.tileTagLight
            : styles.tileTagDark,
          {
            paddingHorizontal: exploreTile.tagPaddingHorizontal * scale,
            paddingVertical: exploreTile.tagPaddingVertical * scale,
          },
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
  );
}

function ExploreTileColumn({ tile, columnIndex, scale }: ExploreTileColumnProps) {
  const isSquareTile = tile.imageLayout === "square";
  const isPortraitLayout = tile.imageLayout === "roundedPortrait";

  const cornerRadius = radii.card * scale;
  const retreatBadgeTop = exploreTile.retreatBadgeOffsetY * scale;
  const pilatesBadgeTop = exploreTile.pilatesBadgeOffsetY * scale;
  const retreatLeadingInset = exploreTile.retreatBadgeOffsetX * scale;

  const pilatesClipH = exploreTile.pilatesClipHeight * scale;
  const pilatesImgLeft = exploreTile.pilatesImageOffsetX * scale;
  const pilatesImgTop = exploreTile.pilatesImageOffsetY * scale;
  const pilatesImgW = exploreTile.pilatesImageWidth * scale;
  const pilatesImgH = exploreTile.pilatesImageHeight * scale;

  const columnPad =
    columnIndex === 0
      ? { paddingBottom: exploreTile.springColumnPaddingBottom * scale }
      : { paddingTop: exploreTile.enhancedColumnPaddingTop * scale };

  return (
    <View
      style={[
        styles.tileCol,
        columnPad,
        { gap: exploreTile.imageTitleGap * scale },
      ]}
    >
      <View
        style={[
          styles.tileImageWrap,
          { borderRadius: cornerRadius },
          isSquareTile ? styles.tileImageRoundedSquare : null,
          isPortraitLayout ? { height: pilatesClipH } : null,
        ]}
      >
        {isPortraitLayout ? (
          <View style={styles.pilatesClip} pointerEvents="none">
            <Image
              source={resolveExploreImageSource(tile.imageUriKey)}
              style={{
                position: "absolute",
                left: pilatesImgLeft,
                top: pilatesImgTop,
                width: pilatesImgW,
                height: pilatesImgH,
              }}
              contentFit="cover"
              contentPosition="bottom"
            />
          </View>
        ) : (
          <Image
            source={resolveExploreImageSource(tile.imageUriKey)}
            style={styles.tileImage}
            contentFit="cover"
            contentPosition="center"
          />
        )}
        <ExploreTileTagRow
          tile={tile}
          scale={scale}
          badgeTop={isPortraitLayout ? pilatesBadgeTop : retreatBadgeTop}
          retreatLeadingInset={retreatLeadingInset}
        />
      </View>
      <Text
        style={[
          styles.tileTitle,
          (isSquareTile || isPortraitLayout) && styles.tileTitleCentered,
        ]}
        numberOfLines={2}
      >
        {tile.title}
      </Text>
    </View>
  );
}

export function ExploreSection({
  journalEyebrow,
  journalTitle,
  tiles,
}: ExploreSectionProps) {
  const { width: windowWidth } = useWindowDimensions();
  const exploreTileWidth =
    (windowWidth - space.screenHorizontal * 2 - space.md) / 2;
  const exploreScale = exploreTileWidth / exploreTile.baseWidth;

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
            source={figmaRemoteAssets.exploreFeatured}
            style={styles.heroImage}
            contentFit="cover"
            accessibilityLabel="Wellness journal feature"
          />
        </View>

        <View style={styles.labelCardOuter}>
          <BlurView
            intensity={EXPLORE_JOURNAL_LABEL_BLUR_INTENSITY}
            tint="light"
            style={styles.labelBlur}
          >
            <LinearGradient
              pointerEvents="none"
              colors={[
                colors.detailsGlassSheenStrong,
                colors.detailsGlassSheenSoft,
                "transparent",
                "transparent",
              ]}
              locations={[0, 0.12, 0.34, 1]}
              start={{ x: 0.02, y: 0.02 }}
              end={{ x: 0.48, y: 0.38 }}
              style={styles.labelGlassSheen}
            />
            <LinearGradient
              pointerEvents="none"
              colors={[EXPLORE_JOURNAL_TOP_EDGE_SHEEN, "transparent"]}
              locations={[0, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.labelTopEdgeSheen}
            />
            <View style={styles.labelInner}>
              <View style={styles.labelTextCol}>
                <Text style={styles.eyebrow}>{journalEyebrow}</Text>
                <Text style={styles.journalTitle} numberOfLines={2}>
                  {journalTitle}
                </Text>
              </View>
            </View>
          </BlurView>
        </View>
      </View>

      <View style={styles.tileGrid}>
        {tiles.map((tile, columnIndex) => (
          <ExploreTileColumn
            key={tile.id}
            tile={tile}
            columnIndex={columnIndex}
            scale={exploreScale}
          />
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
  labelCardOuter: {
    position: "absolute",
    left: space.lg,
    right: space.lg,
    bottom: -space.lg,
    borderRadius: radii.labelCard,
    ...Platform.select({
      ios: {
        shadowColor: "#d8e4ef",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.38,
        shadowRadius: 18,
      },
      android: {
        elevation: 10,
      },
      default: {},
    }),
  },
  labelBlur: {
    borderRadius: radii.labelCard,
    overflow: "hidden",
    backgroundColor: EXPLORE_JOURNAL_GLASS_BASE,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  labelGlassSheen: {
    ...StyleSheet.absoluteFillObject,
  },
  labelTopEdgeSheen: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 4,
  },
  labelInner: {
    position: "relative",
    zIndex: 1,
    padding: space.lg,
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
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  journalTitle: {
    fontFamily: fontFamilies.newsreader.regular,
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.white,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  tileGrid: {
    flexDirection: "row",
    gap: space.md,
    marginTop: space.xl,
    overflow: "visible",
  },
  tileCol: {
    flex: 1,
    minWidth: 0,
    alignItems: "stretch",
  },
  tileImageWrap: {
    overflow: "hidden",
    width: "100%",
    backgroundColor: colors.white,
  },
  tileImageRoundedSquare: {
    aspectRatio: 1,
  },
  pilatesClip: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  tileImage: {
    width: "100%",
    height: "100%",
  },
  tileTagRow: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
  },
  tileTagRowLeading: {
    justifyContent: "flex-start",
  },
  tileTagRowCentered: {
    justifyContent: "center",
  },
  tileTag: {
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
  tileTitleCentered: {
    textAlign: "center",
  },
});
