import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSession } from "../../../src/auth/SessionProvider";
import { ManagerClientsScreen } from "../../../src/features/manager/screens/ManagerClientsScreen";
import { colors } from "../../../src/theme/tokens";

/** Manager clients directory — searchable list aligned with web `/manager/clients`. */
export default function ManagerClientsMobileRoute() {
  const { isReady, isSignedIn, role } = useSession();

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

  if (role !== "MANAGER" && role !== "ADMIN") {
    return <Redirect href="/home" />;
  }

  return <ManagerClientsScreen />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
  },
});
