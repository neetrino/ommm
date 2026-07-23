import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSession } from "../../../src/auth/SessionProvider";
import { PlaceholderTabScreen } from "../../../src/features/shell/PlaceholderTabScreen";
import { colors } from "../../../src/theme/tokens";

/** Manager workspace home — aligns with web `/manager/home`. */
export default function ManagerHomeRoute() {
  const { isReady, isSignedIn } = useSession();

  if (!isReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.taupe} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <PlaceholderTabScreen
      title="Manager"
      subtitle="You are signed in as a studio manager. Use the web app for the full operations dashboard."
    />
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
  },
});
