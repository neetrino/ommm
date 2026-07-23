import { Image } from "expo-image";
import { Text, View } from "react-native";
import { exploreTile, radii } from "../../../../theme/tokens";
import { ExploreTileTagRow } from "./ExploreTileTagRow";
import { exploreStyles as styles } from "./exploreStyles";
import type { ExploreTileColumnProps } from "./exploreTypes";
import { resolveExploreImageSource } from "./resolveExploreImageSource";

export function ExploreTileColumn({
  tile,
  columnIndex,
  scale,
}: ExploreTileColumnProps) {
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
          <View style={styles.pilatesClip}>
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
