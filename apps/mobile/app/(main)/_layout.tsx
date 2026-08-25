import { Slot, usePathname } from "expo-router";
import { StyleSheet, View } from "react-native";
import { FloatingTabBar } from "../../src/features/home/components/FloatingTabBar";
import { useSession } from "../../src/auth/SessionProvider";
import { colors } from "../../src/theme/tokens";

function isPaymentOutcomeRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/user/payment/success") ||
    pathname.startsWith("/user/payment/fail") ||
    pathname.startsWith("/user/payment/pending")
  );
}

export default function MainLayout() {
  const { isReady, isSignedIn } = useSession();
  const pathname = usePathname();
  const isStartupSplashRoute = pathname === "/home";
  /** Authenticated app shell only — never on splash or payment result pages. */
  const showFloatingTabBar =
    isSignedIn && !isStartupSplashRoute && !isPaymentOutcomeRoute(pathname);

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
