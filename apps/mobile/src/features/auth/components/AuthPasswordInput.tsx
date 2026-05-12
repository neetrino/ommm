import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

const EYE_ICON_SIZE = 22;

export type AuthPasswordInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  textContentType?: "password" | "newPassword";
  autoComplete?: "password" | "password-new";
  accessibilityLabel: string;
};

export function AuthPasswordInput({
  value,
  onChangeText,
  placeholder,
  textContentType = "password",
  autoComplete,
  accessibilityLabel,
}: AuthPasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const toggle = useCallback(() => {
    setVisible((v) => !v);
  }, []);

  return (
    <View style={styles.shell}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.bodyMuted}
        style={styles.input}
        secureTextEntry={!visible}
        textContentType={textContentType}
        {...(autoComplete !== undefined ? { autoComplete } : {})}
        accessibilityLabel={accessibilityLabel}
      />
      <Pressable
        onPress={toggle}
        style={({ pressed }) => [styles.eyeWrap, pressed && styles.eyePressed]}
        accessibilityRole="button"
        accessibilityLabel={visible ? "Hide password" : "Show password"}
        accessibilityState={{ selected: visible }}
        hitSlop={8}
      >
        <MaterialCommunityIcons
          name={visible ? "eye-off-outline" : "eye-outline"}
          size={EYE_ICON_SIZE}
          color={colors.secondarySage}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.labelCard,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.glassBorder,
    backgroundColor: colors.overlayWhite38,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingLeft: space.lg,
    paddingRight: space.xs,
    paddingVertical: space.md,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    color: colors.primaryGreen,
  },
  eyeWrap: {
    justifyContent: "center",
    alignItems: "center",
    paddingRight: space.md,
    paddingVertical: space.sm,
  },
  eyePressed: {
    opacity: 0.75,
  },
});
