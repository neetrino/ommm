import { StyleSheet, View } from "react-native";
import { colors } from "../../../theme/tokens";

/**
 * Play glyph from Figma node 1:185 (Ommm. Space) — vector path approximated as
 * a right-pointing triangle; avoids raster + keeps sharp edges on all densities.
 */
const PLAY_TRIANGLE_W = 8;
const PLAY_TRIANGLE_H = 10;

type ExploreFeaturedPlayIconProps = {
  /** Renders white on the dark gradient button (Figma). */
  color?: string;
};

export function ExploreFeaturedPlayIcon({
  color = colors.white,
}: ExploreFeaturedPlayIconProps) {
  const halfH = PLAY_TRIANGLE_H / 2;
  return (
    <View
      style={[
        styles.wrap,
        { width: PLAY_TRIANGLE_W, height: PLAY_TRIANGLE_H },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View
        style={[
          styles.triangle,
          {
            borderTopWidth: halfH,
            borderBottomWidth: halfH,
            borderLeftWidth: PLAY_TRIANGLE_W,
            borderLeftColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  triangle: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderRightWidth: 0,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "transparent",
    marginLeft: 1.5,
  },
});
