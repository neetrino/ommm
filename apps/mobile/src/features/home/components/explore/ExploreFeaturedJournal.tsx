import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { figmaRemoteAssets } from "../../../../assets/figmaRemoteAssets";
import { colors, shadows } from "../../../../theme/tokens";
import {
  EXPLORE_JOURNAL_LABEL_BLUR_INTENSITY,
  EXPLORE_JOURNAL_TOP_EDGE_SHEEN,
} from "./exploreConstants";
import { exploreStyles as styles } from "./exploreStyles";

type ExploreFeaturedJournalProps = {
  journalEyebrow: string;
  journalTitle: string;
};

export function ExploreFeaturedJournal({
  journalEyebrow,
  journalTitle,
}: ExploreFeaturedJournalProps) {
  return (
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
  );
}
