import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSession } from "../../../../src/auth/SessionProvider";
import { colors } from "../../../../src/theme/tokens";

/** Legacy route — password lives under Account information. */
export default function UserProfileChangePasswordRoute() {
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

  return <Redirect href="/user/profile/personal" />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
  },
});
