import { LinearGradient } from "expo-linear-gradient";
import {
  NEXT_CLASS_GLASS_CORNER_FLARE,
  NEXT_CLASS_GLASS_CORNER_FLARE_SOFT,
  NEXT_CLASS_GLASS_DIAG_GLEAM,
  NEXT_CLASS_GLASS_DIAG_GLEAM_MID,
  NEXT_CLASS_GLASS_HOT_SPOT,
  NEXT_CLASS_GLASS_SHEEN_FLOOR,
  NEXT_CLASS_GLASS_SHEEN_MID,
  NEXT_CLASS_GLASS_SHEEN_PEAK,
  NEXT_CLASS_GLASS_TOP_EDGE_FLARE,
  NEXT_CLASS_GLASS_TOP_GLOW,
  NEXT_CLASS_GLASS_TOP_GLOW_MID,
} from "./nextClassGlassConstants";
import { nextClassStyles as styles } from "./nextClassStyles";

export function NextClassGlassOverlays() {
  return (
    <>
      <LinearGradient
        pointerEvents="none"
        colors={[
          NEXT_CLASS_GLASS_SHEEN_PEAK,
          NEXT_CLASS_GLASS_SHEEN_MID,
          NEXT_CLASS_GLASS_SHEEN_FLOOR,
          "transparent",
        ]}
        locations={[0, 0.05, 0.14, 0.32]}
        start={{ x: 0.02, y: 0.02 }}
        end={{ x: 0.48, y: 0.38 }}
        style={styles.detailsGlassSheen}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[
          NEXT_CLASS_GLASS_TOP_GLOW,
          NEXT_CLASS_GLASS_TOP_GLOW_MID,
          "transparent",
        ]}
        locations={[0, 0.1, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.detailsGlassTopBand}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[
          NEXT_CLASS_GLASS_DIAG_GLEAM,
          NEXT_CLASS_GLASS_DIAG_GLEAM_MID,
          "transparent",
          "transparent",
        ]}
        locations={[0, 0.07, 0.22, 0.45]}
        start={{ x: 0.08, y: 0.12 }}
        end={{ x: 0.92, y: 0.78 }}
        style={styles.detailsGlassDiagonalGleam}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[NEXT_CLASS_GLASS_HOT_SPOT, "transparent"]}
        locations={[0, 0.32]}
        start={{ x: 0.22, y: 0.08 }}
        end={{ x: 0.55, y: 0.35 }}
        style={styles.detailsGlassHotSpot}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[
          "transparent",
          NEXT_CLASS_GLASS_CORNER_FLARE,
          NEXT_CLASS_GLASS_CORNER_FLARE_SOFT,
        ]}
        locations={[0.62, 0.88, 1]}
        start={{ x: 0.35, y: 0.4 }}
        end={{ x: 1, y: 1 }}
        style={styles.detailsGlassCornerFlare}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[NEXT_CLASS_GLASS_TOP_EDGE_FLARE, "transparent"]}
        locations={[0, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.detailsGlassTopEdgeFlare}
      />
    </>
  );
}
