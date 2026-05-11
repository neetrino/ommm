import { type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { colors, space } from "../../../theme/tokens";

const AUTH_TOP_INSET_EXTRA = space.xxl;
const AUTH_BOTTOM_INSET_EXTRA = space.xl;
const AUTH_MAX_CONTENT_WIDTH = 400;

type AuthScreenShellProps = {
  children: ReactNode;
  /** Use when the screen has text fields (keyboard-safe scroll). */
  keyboardAware?: boolean;
};

export function AuthScreenShell({
  children,
  keyboardAware = false,
}: AuthScreenShellProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = insets.top + AUTH_TOP_INSET_EXTRA;
  const paddingBottom = insets.bottom + AUTH_BOTTOM_INSET_EXTRA;

  const scroll = (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop,
          paddingBottom,
          paddingHorizontal: space.screenHorizontal,
        },
      ]}
    >
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );

  return (
    <View style={styles.root}>
      <GradientBackdrop />
      {keyboardAware ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {scroll}
        </KeyboardAvoidingView>
      ) : (
        scroll
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  inner: {
    width: "100%",
    maxWidth: AUTH_MAX_CONTENT_WIDTH,
    alignSelf: "center",
    gap: space.xl,
  },
});
