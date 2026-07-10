import { Redirect } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSession } from "../src/auth/SessionProvider";
import { colors } from "../src/theme/tokens";

/** App entry — signed-in users skip splash; guests land on `/home` splash. */
export default function Index() {
  const { isReady, isSignedIn, homeHref } = useSession();

  if (!isReady) {
    return <View style={styles.boot} />;
  }

  if (isSignedIn) {
    return <Redirect href={homeHref} />;
  }

  return <Redirect href="/home" />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
});
