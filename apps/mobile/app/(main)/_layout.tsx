import { Slot, usePathname } from "expo-router";
import { StyleSheet, View } from "react-native";
import { FloatingTabBar } from "../../src/features/home/components/FloatingTabBar";
import { useSession } from "../../src/auth/SessionProvider";
import { colors } from "../../src/theme/tokens";

export default function MainLayout() {
  const { isReady, isSignedIn } = useSession();
  const pathname = usePathname();
  const isStartupSplashRoute = pathname === "/home";
  /** Authenticated app shell only — never on startup splash route. */
  const showFloatingTabBar = isSignedIn && !isStartupSplashRoute;

  if (!isReady) {
    return <View style={styles.boot} />;
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
