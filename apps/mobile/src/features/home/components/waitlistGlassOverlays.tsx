import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

export const WAITLIST_CARD_BLUR_INTENSITY = 24;

export const WAITLIST_LIGHT_GLASS_BASE = "rgba(255,255,255,0.06)" as const;
const WAITLIST_LIGHT_SHEEN_PEAK = "rgba(255,255,255,0.9)" as const;
const WAITLIST_LIGHT_SHEEN_MID = "rgba(255,255,255,0.3)" as const;
const WAITLIST_LIGHT_SHEEN_FLOOR = "rgba(255,255,255,0.1)" as const;
const WAITLIST_LIGHT_TOP_GLOW = "rgba(255,255,255,0.52)" as const;
const WAITLIST_LIGHT_TOP_MID = "rgba(255,255,255,0.14)" as const;
const WAITLIST_LIGHT_DIAG = "rgba(255,255,255,0.34)" as const;
const WAITLIST_LIGHT_TOP_EDGE = "rgba(255,255,255,0.96)" as const;

export const WAITLIST_DARK_GLASS_BASE = "rgba(14,18,24,0.44)" as const;
const WAITLIST_DARK_SHEEN_PEAK = "rgba(255,255,255,0.58)" as const;
const WAITLIST_DARK_SHEEN_MID = "rgba(255,255,255,0.22)" as const;
const WAITLIST_DARK_SHEEN_FLOOR = "rgba(255,255,255,0.1)" as const;
const WAITLIST_DARK_TOP_GLOW = "rgba(255,255,255,0.4)" as const;
const WAITLIST_DARK_TOP_MID = "rgba(255,255,255,0.12)" as const;
const WAITLIST_DARK_DIAG = "rgba(255,255,255,0.36)" as const;
const WAITLIST_DARK_TOP_EDGE = "rgba(255,255,255,0.78)" as const;
export const WAITLIST_DARK_RIM = "rgba(255,255,255,0.68)" as const;

export function WaitlistLightGlassOverlays() {
  return (
    <>
      <LinearGradient
        colors={[
          WAITLIST_LIGHT_SHEEN_PEAK,
          WAITLIST_LIGHT_SHEEN_MID,
          WAITLIST_LIGHT_SHEEN_FLOOR,
          "transparent",
        ]}
        locations={[0, 0.05, 0.16, 0.4]}
        start={{ x: 0.02, y: 0.02 }}
        end={{ x: 0.5, y: 0.4 }}
        style={styles.glassOverlayFill}
      />
      <LinearGradient
        colors={[WAITLIST_LIGHT_DIAG, "transparent", "transparent"]}
        locations={[0, 0.16, 1]}
        start={{ x: 0.12, y: 0.12 }}
        end={{ x: 0.88, y: 0.72 }}
        style={styles.glassOverlayFill}
      />
      <LinearGradient
        colors={[
          WAITLIST_LIGHT_TOP_GLOW,
          WAITLIST_LIGHT_TOP_MID,
          "transparent",
        ]}
        locations={[0, 0.1, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.cardGlassTopBand}
      />
      <LinearGradient
        colors={[WAITLIST_LIGHT_TOP_EDGE, "transparent"]}
        locations={[0, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.cardGlassTopEdge}
      />
    </>
  );
}

export function WaitlistDarkGlassOverlays() {
  return (
    <>
      <LinearGradient
        colors={[
          WAITLIST_DARK_SHEEN_PEAK,
          WAITLIST_DARK_SHEEN_MID,
          WAITLIST_DARK_SHEEN_FLOOR,
          "transparent",
        ]}
        locations={[0, 0.06, 0.18, 0.44]}
        start={{ x: 0.02, y: 0.02 }}
        end={{ x: 0.52, y: 0.42 }}
        style={styles.glassOverlayFill}
      />
      <LinearGradient
        colors={[WAITLIST_DARK_TOP_GLOW, WAITLIST_DARK_TOP_MID, "transparent"]}
        locations={[0, 0.11, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.cardGlassTopBand}
      />
      <LinearGradient
        colors={[WAITLIST_DARK_DIAG, "transparent", "transparent"]}
        locations={[0, 0.14, 1]}
        start={{ x: 0.1, y: 0.15 }}
        end={{ x: 0.9, y: 0.75 }}
        style={styles.glassOverlayFill}
      />
      <LinearGradient
        colors={[WAITLIST_DARK_TOP_EDGE, "transparent"]}
        locations={[0, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.cardGlassTopEdge}
      />
    </>
  );
}

const styles = StyleSheet.create({
  cardGlassTopBand: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "42%",
    pointerEvents: "none",
  },
  cardGlassTopEdge: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 4,
    pointerEvents: "none",
  },
  glassOverlayFill: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
  },
});
