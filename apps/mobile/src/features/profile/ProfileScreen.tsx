import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackdrop } from "../../components/layout/GradientBackdrop";
import { fetchHealth } from "../../lib/api/client";
import { fontFamilies } from "../../theme/fontFamilies";
import { colors, layout, space, typography } from "../../theme/tokens";

type LoadState =
  | { status: "loading" }
  | { status: "ok"; message: string }
  | { status: "error"; message: string };

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const bottomPad =
    layout.tabBarHeight + Math.max(insets.bottom, space.sm) + space.lg;

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetchHealth();
      setState({ status: "ok", message: res.status });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Unable to reach the API.";
      setState({ status: "error", message });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={styles.root}>
      <GradientBackdrop />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.lead}>
          Backend connectivity uses{" "}
          <Text style={styles.mono}>EXPO_PUBLIC_API_URL</Text> from the root
          <Text style={styles.mono}> .env</Text> (never commit secrets).
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>API health</Text>
          {state.status === "loading" ? (
            <ActivityIndicator color={colors.taupe} />
          ) : null}
          {state.status === "ok" ? (
            <Text style={styles.ok}>Status: {state.message}</Text>
          ) : null}
          {state.status === "error" ? (
            <Text style={styles.err}>{state.message}</Text>
          ) : null}
          <Pressable
            onPress={() => void load()}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Refresh API health"
          >
            <Text style={styles.buttonLabel}>Refresh</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: space.screenHorizontal,
    paddingTop: space.xxl,
    gap: space.lg,
  },
  title: {
    fontFamily: fontFamilies.newsreader.semiBoldItalic,
    fontSize: typography.sectionTitle + 6,
    lineHeight: 32,
    color: colors.primaryGreen,
  },
  lead: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.warmBrown,
  },
  mono: {
    fontFamily: fontFamilies.manrope.semiBold,
    color: colors.primaryGreen,
  },
  card: {
    backgroundColor: colors.overlayWhite38,
    borderRadius: 24,
    padding: space.lg,
    gap: space.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  cardTitle: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    color: colors.primaryGreen,
  },
  ok: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    color: colors.primaryGreen,
  },
  err: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.danger,
  },
  button: {
    alignSelf: "flex-start",
    marginTop: space.sm,
    backgroundColor: colors.taupe,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: 9999,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
