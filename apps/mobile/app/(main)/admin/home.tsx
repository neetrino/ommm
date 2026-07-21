import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSession } from "../../../src/auth/SessionProvider";
import { PlaceholderTabScreen } from "../../../src/features/shell/PlaceholderTabScreen";
import { colors } from "../../../src/theme/tokens";

/**
 * Admin / content-admin home — route aligns with web `/admin/home`.
 */
export default function AdminHomeRoute() {
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
      title="Studio admin"
      subtitle="You are signed in with an administrator role. Use the web dashboard for full back-office tools."
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
