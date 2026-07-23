import { StyleSheet, View } from "react-native";
import { CircularBackButton } from "../../../components/navigation/CircularBackButton";
import { useTranslations } from "../../../i18n/I18nProvider";
import { AUTH_BACK_TOP_NUDGE_DOWN } from "./AuthBackToHomeRow.constants";

export {
  AUTH_BACK_TO_HOME_TOP_RESERVE,
  AUTH_BACK_TOP_NUDGE_DOWN,
} from "./AuthBackToHomeRow.constants";

/** Visual-only downward shift of the control (shell `paddingTop` / scroll reserve unchanged). */
const AUTH_BACK_BUTTON_ONLY_NUDGE_Y = AUTH_BACK_TOP_NUDGE_DOWN * 2;

type AuthBackToHomeRowProps = {
  onPress: () => void;
  accessibilityLabel?: string;
};

export function AuthBackToHomeRow({
  onPress,
  accessibilityLabel,
}: AuthBackToHomeRowProps) {
  const tNav = useTranslations("dashboard.shell");
  const label = accessibilityLabel ?? tNav("fallbackTitle");

  return (
    <View style={styles.backRow}>
      <View style={styles.backButtonShift}>
        <CircularBackButton onPress={onPress} accessibilityLabel={label} />
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
