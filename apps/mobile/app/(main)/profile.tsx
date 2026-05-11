import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSession } from "../../src/auth/SessionProvider";
import { ProfileScreen } from "../../src/features/profile/ProfileScreen";
import { colors } from "../../src/theme/tokens";

export default function ProfileRoute() {
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

  return <ProfileScreen />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
  },
});
