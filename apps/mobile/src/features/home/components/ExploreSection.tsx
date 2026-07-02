import { Text, View } from "react-native";
import { ExploreFeaturedJournal } from "./explore/ExploreFeaturedJournal";
import { ExploreTileColumn } from "./explore/ExploreTileColumn";
import { exploreStyles as styles } from "./explore/exploreStyles";
import type { ExploreSectionProps } from "./explore/exploreTypes";
import { useExploreTileScale } from "./explore/useExploreTileScale";

export function ExploreSection({
  journalEyebrow,
  journalTitle,
  tiles,
}: ExploreSectionProps) {
  const exploreScale = useExploreTileScale();

  return (
    <View style={styles.section}>
      <View style={styles.titleWrap}>
        <Text style={styles.watermark} pointerEvents="none">
          News
        </Text>
        <Text style={styles.title}>Explore</Text>
      </View>

      <ExploreFeaturedJournal
        journalEyebrow={journalEyebrow}
        journalTitle={journalTitle}
      />

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
