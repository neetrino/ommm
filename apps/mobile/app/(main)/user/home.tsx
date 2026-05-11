import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSession } from "../../../src/auth/SessionProvider";
import { HomeScreen } from "../../../src/features/home/screens/HomeScreen";
import { colors } from "../../../src/theme/tokens";

/**
 * Authenticated member home — URL shows `/user/home` (aligned with web app).
 */
export default function UserHomeRoute() {
  const { isReady, isSignedIn } = useSession();

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

  return <HomeScreen />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
  },
});
