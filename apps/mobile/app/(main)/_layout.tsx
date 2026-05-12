import { Slot } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { FloatingTabBar } from "../../src/features/home/components/FloatingTabBar";
import { useSession } from "../../src/auth/SessionProvider";
import { colors } from "../../src/theme/tokens";

export default function MainLayout() {
  const { isReady, isSignedIn } = useSession();
  /** Authenticated app shell only — hidden for guests (e.g. public home) and outside `(main)`. */
  const showFloatingTabBar = isSignedIn;

  if (!isReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.taupe} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Slot />
      {showFloatingTabBar ? <FloatingTabBar /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
  },
});
