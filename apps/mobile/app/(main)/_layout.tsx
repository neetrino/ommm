import { Slot } from "expo-router";
import { StyleSheet, View } from "react-native";
import { FloatingTabBar } from "../../src/features/home/components/FloatingTabBar";

export default function MainLayout() {
  return (
    <View style={styles.root}>
      <Slot />
      <FloatingTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
