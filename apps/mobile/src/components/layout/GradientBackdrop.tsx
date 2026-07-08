import { StyleSheet, View } from "react-native";
import { colors } from "../../theme/tokens";

/** Solid page backdrop — matches web Schedule / Packages / Contact (`#fbf5d5`). */
export function GradientBackdrop() {
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.backdrop]}
    />
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: colors.canvas,
  },
});
