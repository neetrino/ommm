import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { colors } from "../../../../theme/tokens";
import { NEXT_CLASS_DETAILS_BLUR_INTENSITY } from "./nextClassGlassConstants";
import { NextClassGlassOverlays } from "./NextClassGlassOverlays";
import { nextClassStyles as styles } from "./nextClassStyles";
import type { NextClassContent } from "./nextClassTypes";

type NextClassDetailsPanelProps = {
  content: NextClassContent;
};

export function NextClassDetailsPanel({ content }: NextClassDetailsPanelProps) {
  return (
    <View style={styles.detailsOverlap}>
      <View style={styles.detailsGlassFrame}>
        <BlurView
          intensity={NEXT_CLASS_DETAILS_BLUR_INTENSITY}
          tint="light"
          style={styles.detailsBlur}
        >
          <NextClassGlassOverlays />
          <View style={styles.detailsInner}>
            <View style={styles.detailsTopRow}>
              <View style={styles.detailsTextCol}>
                <Text style={styles.timeText} numberOfLines={2}>
                  {content.timeLocation}
                </Text>
                <Text style={styles.instructorText} numberOfLines={2}>
                  {content.instructor}
                </Text>
              </View>
              <LinearGradient
                colors={[colors.statusGradientStart, colors.statusGradientEnd]}
                start={{ x: 0.1, y: 0.1 }}
                end={{ x: 0.9, y: 0.9 }}
                style={styles.statusPill}
              >
                <Text style={styles.statusText}>{content.statusLabel}</Text>
              </LinearGradient>
            </View>

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.05)", "transparent"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.divider}
            />

            <View style={styles.detailsFooter}>
              <Text style={styles.metaText}>{content.durationLabel}</Text>
              <View style={styles.spotsRow}>
                <View style={styles.spotDot} />
                <Text style={styles.metaText}>{content.spotsLabel}</Text>
              </View>
            </View>
          </View>
        </BlurView>
      </View>
    </View>
  );
}
