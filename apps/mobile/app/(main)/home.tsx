import { StyleSheet, View } from "react-native";
import { colors } from "../../src/theme/tokens";

/** Public home at `/home` — intentionally blank. */
export default function PublicHomeRoute() {
  return <View style={styles.blank} />;
}

const styles = StyleSheet.create({
  blank: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
