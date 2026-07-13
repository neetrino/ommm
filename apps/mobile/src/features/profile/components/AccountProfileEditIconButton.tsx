import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useTranslations } from "../../../i18n/I18nProvider";
import { colors } from "../../../theme/tokens";

/** Matches web `EditActionButton` — 32px circular frosted control. */
const BUTTON_SIZE = 32;
const ICON_SIZE = 16;
const PEN_HIT_SLOP = 8;

type AccountProfileEditIconButtonProps = {
  onPress: () => void;
};

/** Web `PencilGlyph` paths from `edit-action-button.tsx`. */
function PencilGlyph() {
  return (
    <Svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path
        d="M12 20h9"
        stroke={colors.primaryGreen}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"
        stroke={colors.primaryGreen}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Account-info edit control — mirrors web `EditActionButton` (icon-only).
 */
export function AccountProfileEditIconButton({
  onPress,
}: AccountProfileEditIconButtonProps) {
  const tForm = useTranslations("forms.profileEdit");

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={tForm("edit")}
        hitSlop={PEN_HIT_SLOP}
      >
        <PencilGlyph />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "flex-end",
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.6)",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  pressed: {
    backgroundColor: "rgba(255,255,255,0.9)",
    transform: [{ scale: 0.95 }],
  },
});
