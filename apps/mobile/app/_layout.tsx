import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import {
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import {
  Newsreader_300Light_Italic,
  Newsreader_400Regular,
  Newsreader_400Regular_Italic,
  Newsreader_500Medium_Italic,
  Newsreader_600SemiBold,
  Newsreader_600SemiBold_Italic,
} from "@expo-google-fonts/newsreader";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "../src/theme/tokens";

export default function RootLayout() {
  const [loaded] = useFonts({
    Newsreader_400Regular,
    Newsreader_400Regular_Italic,
    Newsreader_300Light_Italic,
    Newsreader_500Medium_Italic,
    Newsreader_600SemiBold,
    Newsreader_600SemiBold_Italic,
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  if (!loaded) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
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
