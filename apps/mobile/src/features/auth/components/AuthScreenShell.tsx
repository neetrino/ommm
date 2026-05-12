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
import { AUTH_BACK_TO_HOME_TOP_RESERVE, AUTH_BACK_TOP_NUDGE_DOWN } from "./AuthBackToHomeRow";

const AUTH_TOP_INSET_EXTRA = space.xxl;
const AUTH_BOTTOM_INSET_EXTRA = space.xl;
const AUTH_MAX_CONTENT_WIDTH = 400;

type AuthScreenShellProps = {
  children: ReactNode;
  /** Use when the screen has text fields (keyboard-safe scroll). */
  keyboardAware?: boolean;
  /**
   * Fixed top-left (within the auth content column) — avoids vertical drift when
   * scroll content uses `justifyContent: "center"` with different form heights (login vs register).
   */
  topLeading?: ReactNode;
};

export function AuthScreenShell({
  children,
  keyboardAware = false,
  topLeading,
}: AuthScreenShellProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = topLeading
    ? insets.top + AUTH_BACK_TO_HOME_TOP_RESERVE
    : insets.top + AUTH_TOP_INSET_EXTRA;
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
      {topLeading ? (
        <View pointerEvents="box-none" style={styles.topLeadingOverlay}>
          <View
            style={[
              styles.topLeadingColumn,
              { paddingTop: insets.top + space.xs + AUTH_BACK_TOP_NUDGE_DOWN, maxWidth: AUTH_MAX_CONTENT_WIDTH },
            ]}
          >
            {topLeading}
          </View>
        </View>
      ) : null}
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
  topLeadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    alignItems: "center",
    paddingHorizontal: space.screenHorizontal,
  },
  topLeadingColumn: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignSelf: "center",
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
