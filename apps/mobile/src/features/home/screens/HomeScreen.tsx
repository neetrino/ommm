import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "../../../auth/SessionProvider";
import { homeMock } from "../../../lib/mocks/homeMock";
import { colors, gradients, layout, space } from "../../../theme/tokens";
import { AppHeader } from "../components/AppHeader";
import { ExploreMoreButton } from "../components/ExploreMoreButton";
import { ExploreSection } from "../components/ExploreSection";
import { GiftCardSection } from "../components/GiftCardSection";
import { HomeHeroSection } from "../components/HomeHeroSection";
import {
  type HighlightCardKey,
  HomeHighlightsSection,
} from "../components/HomeHighlightsSection";
import { NextClassSection } from "../components/NextClassSection";
import { UserGreetingSection } from "../components/UserGreetingSection";
import { WaitlistSection } from "../components/WaitlistSection";

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isSignedIn } = useSession();

  const headerOffset = insets.top + 90;
  const bottomPad =
    layout.tabBarHeight + Math.max(insets.bottom, space.sm) + space.xl;

  const onHeaderBookPress = () => {
    if (isSignedIn) {
      router.push("/classes");
      return;
    }
    router.push("/welcome");
  };

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
        {isSignedIn ? (
          <>
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
          </>
        ) : (
          <>
            <HomeHeroSection
              isSignedIn={false}
              onPrimaryPress={() => router.push("/welcome")}
              onSecondaryPress={() => router.push("/register")}
              onPreviewPress={() => router.push("/classes")}
            />
            <HomeHighlightsSection
              onCardPress={(key: HighlightCardKey) => {
                if (key === "schedule") {
                  router.push("/welcome");
                  return;
                }
                if (key === "memberships") {
                  router.push("/plans");
                  return;
                }
                router.push("/classes");
              }}
            />
            <View style={styles.guestExploreWrap}>
              <ExploreMoreButton onPress={() => router.push("/classes")} />
            </View>
            <GiftCardSection
              content={homeMock.giftCard}
              onBuyPress={() => router.push("/welcome")}
            />
          </>
        )}
      </ScrollView>

      <AppHeader onBookPress={onHeaderBookPress} />
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
  guestExploreWrap: {
    paddingTop: space.md,
  },
});
