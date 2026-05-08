import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

/**
 * Minimal shell: full-screen white (no network on mount — avoids blank/red screen if env/API is off).
 */
export function App() {
  return (
    <View style={styles.root}>
      <Text style={styles.greeting}>hello world</Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111",
  },
});
