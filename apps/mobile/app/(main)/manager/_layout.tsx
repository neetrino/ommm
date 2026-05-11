import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSession } from "../../../src/auth/SessionProvider";
import { homeHrefForRole } from "../../../src/auth/roleHome";
import { colors } from "../../../src/theme/tokens";

export default function ManagerRouteGroupLayout() {
  const { isReady, isSignedIn, role } = useSession();

  if (!isReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.taupe} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/home" />;
  }

  if (role !== "MANAGER") {
    return <Redirect href={homeHrefForRole(role ?? "USER")} />;
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
  },
});
