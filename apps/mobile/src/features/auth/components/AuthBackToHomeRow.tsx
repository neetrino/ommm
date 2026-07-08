import { StyleSheet, View } from "react-native";
import { CircularBackButton } from "../../../components/navigation/CircularBackButton";
import { AUTH_BACK_TOP_NUDGE_DOWN } from "./AuthBackToHomeRow.constants";

export {
  AUTH_BACK_TO_HOME_TOP_RESERVE,
  AUTH_BACK_TOP_NUDGE_DOWN,
} from "./AuthBackToHomeRow.constants";

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
      <View style={styles.backButtonShift}>
        <CircularBackButton onPress={onPress} accessibilityLabel={accessibilityLabel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backRow: {
    alignSelf: "flex-start",
  },
  backButtonShift: {
    transform: [{ translateY: AUTH_BACK_BUTTON_ONLY_NUDGE_Y }],
  },
});
