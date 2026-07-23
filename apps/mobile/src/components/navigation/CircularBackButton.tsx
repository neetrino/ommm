import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { platformShadow } from "../../theme/platformShadow";
import { colors } from "../../theme/tokens";

/** Web auth control: `bg-white/75`, `border-white/70`. */
const BACK_BUTTON_SURFACE = "rgba(255,255,255,0.75)";
const BACK_BUTTON_BORDER = "rgba(255,255,255,0.7)";
export const CIRCULAR_BACK_BUTTON_SIZE = 40;
const BACK_CHEVRON_SIZE = 22;
const BACK_SHADOW_COLOR = "#2d2823";

type CircularBackButtonProps = {
  onPress: () => void;
  accessibilityLabel?: string;
};

/** Circular frosted back control — shared by auth screens and in-app navigation. */
export function CircularBackButton({
  onPress,
  accessibilityLabel = "Go back",
}: CircularBackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <MaterialCommunityIcons
        name="chevron-left"
        size={BACK_CHEVRON_SIZE}
        color={colors.primaryGreen}
        accessibilityIgnoresInvertColors
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: CIRCULAR_BACK_BUTTON_SIZE,
    height: CIRCULAR_BACK_BUTTON_SIZE,
    borderRadius: CIRCULAR_BACK_BUTTON_SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: BACK_BUTTON_BORDER,
    backgroundColor: BACK_BUTTON_SURFACE,
    alignItems: "center",
    justifyContent: "center",
    ...platformShadow({
      color: BACK_SHADOW_COLOR,
      offsetHeight: 2,
      opacity: 0.12,
      radius: 4,
      elevation: 3,
    }),
  },
  buttonPressed: {
    opacity: 0.92,
  },
});
