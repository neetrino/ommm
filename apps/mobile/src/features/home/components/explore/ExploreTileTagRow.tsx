import { Text, View } from "react-native";
import { exploreTile } from "../../../../theme/tokens";
import { exploreStyles as styles } from "./exploreStyles";
import type { ExploreTileTagRowProps } from "./exploreTypes";

export function ExploreTileTagRow({
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
