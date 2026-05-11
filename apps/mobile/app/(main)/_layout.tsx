import { Slot } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { FloatingTabBar } from "../../src/features/home/components/FloatingTabBar";
import { useSession } from "../../src/auth/SessionProvider";
import { colors } from "../../src/theme/tokens";

export default function MainLayout() {
  const { isReady } = useSession();

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
      <FloatingTabBar />
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
