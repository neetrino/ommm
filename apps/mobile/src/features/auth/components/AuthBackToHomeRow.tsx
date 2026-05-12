import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { colors, space } from "../../../theme/tokens";

/** Web auth control: `bg-white/75`, `border-white/70`. */
const AUTH_BACK_BUTTON_SURFACE = "rgba(255,255,255,0.75)";
const AUTH_BACK_BUTTON_BORDER = "rgba(255,255,255,0.7)";
export const AUTH_BACK_BUTTON_SIZE = 40;
const AUTH_BACK_CHEVRON_SIZE = 22;
const AUTH_BACK_SHADOW_COLOR = "#2d2823";

/** Core row: top gap + hit target + gap before form (matches previous layout). */
const AUTH_BACK_TO_HOME_ROW_BASE =
  space.xs + AUTH_BACK_BUTTON_SIZE + space.md;

/** Lower the control ~30% vs the base row block (login + register). */
const AUTH_BACK_TOP_NUDGE_FRACTION = 0.3;
export const AUTH_BACK_TOP_NUDGE_DOWN = Math.round(
  AUTH_BACK_TO_HOME_ROW_BASE * AUTH_BACK_TOP_NUDGE_FRACTION,
);

/** Vertical space from safe-area top to first line of scroll content when using `topLeading` in `AuthScreenShell`. */
export const AUTH_BACK_TO_HOME_TOP_RESERVE =
  AUTH_BACK_TO_HOME_ROW_BASE + AUTH_BACK_TOP_NUDGE_DOWN;

/** Visual-only downward shift of the control (shell `paddingTop` / scroll reserve unchanged). */
const AUTH_BACK_BUTTON_ONLY_NUDGE_Y = AUTH_BACK_TOP_NUDGE_DOWN * 2;

type AuthBackToHomeRowProps = {
  onPress: () => void;
  /** Defaults to English; override if you add i18n for auth chrome. */
  accessibilityLabel?: string;
};

export function AuthBackToHomeRow({
  onPress,
  accessibilityLabel = "Back to home",
}: AuthBackToHomeRowProps) {
  return (
    <View style={styles.backRow}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.backButton,
          styles.backButtonShift,
          pressed && styles.backButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <MaterialCommunityIcons
          name="chevron-left"
          size={AUTH_BACK_CHEVRON_SIZE}
          color={colors.primaryGreen}
          accessibilityIgnoresInvertColors
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  backRow: {
    alignSelf: "flex-start",
  },
  backButton: {
    width: AUTH_BACK_BUTTON_SIZE,
    height: AUTH_BACK_BUTTON_SIZE,
    borderRadius: AUTH_BACK_BUTTON_SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: AUTH_BACK_BUTTON_BORDER,
    backgroundColor: AUTH_BACK_BUTTON_SURFACE,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: AUTH_BACK_SHADOW_COLOR,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  backButtonShift: {
    transform: [{ translateY: AUTH_BACK_BUTTON_ONLY_NUDGE_Y }],
  },
  backButtonPressed: {
    opacity: 0.92,
  },
});
