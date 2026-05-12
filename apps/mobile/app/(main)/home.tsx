import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSession } from "../../src/auth/SessionProvider";
import { HomeScreen } from "../../src/features/home/screens/HomeScreen";
import { colors } from "../../src/theme/tokens";

/**
 * Public marketing home at `/home`. Signed-in users redirect to their role home (`homeHref`).
 */
export default function PublicHomeRoute() {
  const { isReady, isSignedIn, homeHref } = useSession();

  if (!isReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.taupe} />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href={homeHref} />;
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
