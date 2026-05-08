import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { fetchHealth } from "./src/lib/api";

type LoadState =
  | { kind: "loading" }
  | { kind: "ok"; status: string }
  | { kind: "error"; message: string };

export function App() {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const load = useCallback(() => {
    setState({ kind: "loading" });
    void fetchHealth()
      .then((data) => {
        setState({ kind: "ok", status: data.status });
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        setState({ kind: "error", message });
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API check</Text>
      <Text style={styles.hint}>GET /v1/health</Text>
      {state.kind === "loading" ? (
        <ActivityIndicator accessibilityLabel="Loading" size="large" />
      ) : null}
      {state.kind === "ok" ? (
        <Text style={styles.success}>Connected — status: {state.status}</Text>
      ) : null}
      {state.kind === "error" ? (
        <Text style={styles.error}>{state.message}</Text>
      ) : null}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  success: {
    fontSize: 16,
    color: "#0a0",
    textAlign: "center",
  },
  error: {
    fontSize: 15,
    color: "#c00",
    textAlign: "center",
  },
});
