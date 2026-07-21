import { Text, View } from "react-native";
import { useTranslations } from "../../../i18n/I18nProvider";
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
  const t = useTranslations("home.explore");
  const exploreScale = useExploreTileScale();

  return (
    <View style={styles.section}>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>{t("title")}</Text>
      </View>

      <ExploreFeaturedJournal
        journalEyebrow={journalEyebrow}
        journalTitle={journalTitle}
      />

      <View style={styles.tileGrid}>
        {tiles.map((tile, columnIndex) => (
          <ExploreTileColumn
            key={tile.id || `explore-tile-${columnIndex}`}
            tile={tile}
            columnIndex={columnIndex}
            scale={exploreScale}
          />
        ))}
      </View>
    </View>
  );
}
