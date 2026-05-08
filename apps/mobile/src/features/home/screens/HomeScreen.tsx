import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { homeMock } from "../../../lib/mocks/homeMock";
import { colors, gradients, layout, space } from "../../../theme/tokens";
import { AppHeader } from "../components/AppHeader";
import { ExploreMoreButton } from "../components/ExploreMoreButton";
import { ExploreSection } from "../components/ExploreSection";
import { GiftCardSection } from "../components/GiftCardSection";
import { NextClassSection } from "../components/NextClassSection";
import { UserGreetingSection } from "../components/UserGreetingSection";
import { WaitlistSection } from "../components/WaitlistSection";

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const headerOffset = insets.top + 90;
  const bottomPad =
    layout.tabBarHeight + Math.max(insets.bottom, space.sm) + space.xl;

  return (
    <View style={styles.root}>
      <LinearGradient
        pointerEvents="none"
        colors={[...gradients.screen.colors]}
        locations={[...gradients.screen.locations]}
        start={gradients.screen.start}
        end={gradients.screen.end}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerOffset,
            paddingBottom: bottomPad,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <UserGreetingSection firstName={homeMock.user.firstName} />
        <NextClassSection
          content={homeMock.nextClass}
          onAllEventsPress={() => router.push("/schedule")}
          onOpenClassPress={() => router.push("/classes")}
        />
        <WaitlistSection items={[...homeMock.waitlist]} />
        <ExploreSection
          journalEyebrow={homeMock.explore.journalEyebrow}
          journalTitle={homeMock.explore.journalTitle}
          tiles={[...homeMock.explore.tiles]}
        />
        <ExploreMoreButton onPress={() => router.push("/classes")} />
        <GiftCardSection
          content={homeMock.giftCard}
          onBuyPress={() => router.push("/plans")}
        />
      </ScrollView>

      <AppHeader onBookPress={() => router.push("/classes")} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
