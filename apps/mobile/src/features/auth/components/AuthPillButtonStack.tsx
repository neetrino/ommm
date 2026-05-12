import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

/** Share of screen width for the stacked auth CTAs (reference ~80–85%). */
const AUTH_STACK_WIDTH_RATIO = 0.82;
const PILL_MIN_HEIGHT = 56;
/** Light neutral border for ghost “Create account” (reference: thin light gray). */
const GHOST_AUTH_BORDER = "rgba(180, 175, 168, 0.85)" as const;

type AuthPillButtonStackProps = {
  onSignInPress: () => void;
  onCreateAccountPress: () => void;
};

export function AuthPillButtonStack({
  onSignInPress,
  onCreateAccountPress,
}: AuthPillButtonStackProps) {
  const { width: screenWidth } = useWindowDimensions();
  const stackWidth = screenWidth * AUTH_STACK_WIDTH_RATIO;

  return (
    <View style={[styles.stack, { width: stackWidth }]}>
      <Pressable
        onPress={onSignInPress}
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Sign in"
      >
        <Text style={styles.primaryLabel}>Sign in</Text>
      </Pressable>
      <Pressable
        onPress={onCreateAccountPress}
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Create account"
      >
        <Text style={styles.secondaryLabel}>Create account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    alignSelf: "center",
    gap: space.md,
  },
  primary: {
    backgroundColor: colors.taupe,
    paddingVertical: space.md,
    paddingHorizontal: space.xl,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    minHeight: PILL_MIN_HEIGHT,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: GHOST_AUTH_BORDER,
    paddingVertical: space.md,
    paddingHorizontal: space.xl,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    minHeight: PILL_MIN_HEIGHT,
  },
  pressed: {
    opacity: 0.9,
  },
  primaryLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  secondaryLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.secondarySage,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
});
