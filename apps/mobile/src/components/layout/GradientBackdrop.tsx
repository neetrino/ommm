import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { gradients } from "../../theme/tokens";

export function GradientBackdrop() {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[...gradients.screen.colors]}
      locations={[...gradients.screen.locations]}
      start={gradients.screen.start}
      end={gradients.screen.end}
      style={StyleSheet.absoluteFill}
    />
  );
}
