import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { SessionProvider } from "../src/auth/SessionProvider";
import { PushTokenRegistrar } from "../src/auth/PushTokenRegistrar";
import { colors } from "../src/theme/tokens";

export default function RootLayout() {
  const [loaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
    GTSuperDsTrial_Light: require("../assets/fonts/gt-super-ds-trial/gt-super-ds-trial-light.ttf"),
    GTSuperDsTrial_Regular: require("../assets/fonts/gt-super-ds-trial/gt-super-ds-trial-regular.ttf"),
    GTSuperDsTrial_Medium: require("../assets/fonts/gt-super-ds-trial/gt-super-ds-trial-medium.ttf"),
    GTSuperDsTrial_Bold: require("../assets/fonts/gt-super-ds-trial/gt-super-ds-trial-bold.ttf"),
    GTSuperDsTrial_LightItalic: require("../assets/fonts/gt-super-ds-trial/gt-super-ds-trial-light-italic.ttf"),
    GTSuperDsTrial_RegularItalic: require("../assets/fonts/gt-super-ds-trial/gt-super-ds-trial-regular-italic.ttf"),
    GTSuperDsTrial_MediumItalic: require("../assets/fonts/gt-super-ds-trial/gt-super-ds-trial-medium-italic.ttf"),
    GTSuperDsTrial_BoldItalic: require("../assets/fonts/gt-super-ds-trial/gt-super-ds-trial-bold-italic.ttf"),
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
      <I18nProvider>
        <SessionProvider>
          <PushTokenRegistrar />
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </SessionProvider>
      </I18nProvider>
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
