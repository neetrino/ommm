import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "../../../auth/SessionProvider";
import {
  guestPublicTabPath,
  userMemberPath,
} from "../../../navigation/memberPaths";
import { homeMock } from "../../../lib/mocks/homeMock";
import { colors, gradients, layout, space, typography } from "../../../theme/tokens";
import { fontFamilies } from "../../../theme/fontFamilies";
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
import { useMemberHomeFeed } from "../hooks/useMemberHomeFeed";

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isSignedIn, userGreetingName, homeImageUri } = useSession();
  const feed = useMemberHomeFeed(isSignedIn);

  const headerOffset = insets.top + 90;
  const bottomPad =
    layout.tabBarHeight + Math.max(insets.bottom, space.sm) + space.xl;

  const onHeaderBookPress = () => {
    if (isSignedIn) {
      router.push(userMemberPath("classes"));
      return;
    }
    router.push("/login");
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
        {feed.loading ? (
          <View style={styles.feedLoading}>
            <ActivityIndicator size="large" color={colors.taupe} />
          </View>
        ) : null}
        {feed.error !== null ? (
          <Text style={styles.feedError}>{feed.error}</Text>
        ) : null}

        {isSignedIn ? (
          <>
            <UserGreetingSection
              displayName={userGreetingName}
              avatarImageUri={homeImageUri}
            />
            {!feed.loading && feed.error === null ? (
              <>
                {feed.nextClass !== null ? (
                  <NextClassSection
                    content={feed.nextClass}
                    onAllEventsPress={() =>
                      router.push(userMemberPath("schedule"))
                    }
                    onOpenClassPress={() =>
                      router.push(userMemberPath("classes"))
                    }
                  />
                ) : (
                  <Text style={styles.emptyBlock}>You have no bookings</Text>
                )}
                <WaitlistSection items={feed.waitlistItems} />
              </>
            ) : null}
            <ExploreSection
              journalEyebrow={feed.explore.journalEyebrow}
              journalTitle={feed.explore.journalTitle}
              tiles={[...feed.explore.tiles]}
            />
            <ExploreMoreButton
              onPress={() => router.push(userMemberPath("classes"))}
            />
            <GiftCardSection
              content={homeMock.giftCard}
              onBuyPress={() => router.push(userMemberPath("plans"))}
            />
          </>
        ) : (
          <>
            <HomeHeroSection
              isSignedIn={false}
              onPrimaryPress={() => router.push("/login")}
              onSecondaryPress={() => router.push("/register")}
              onPreviewPress={() => router.push("/classes")}
            />
            <HomeHighlightsSection
              onCardPress={(key: HighlightCardKey) => {
                if (key === "schedule") {
                  router.push("/login");
                  return;
                }
                if (key === "memberships") {
                  router.push(guestPublicTabPath.plans);
                  return;
                }
                router.push(guestPublicTabPath.classes);
              }}
            />
            {!feed.loading ? (
              <ExploreSection
                journalEyebrow={feed.explore.journalEyebrow}
                journalTitle={feed.explore.journalTitle}
                tiles={[...feed.explore.tiles]}
              />
            ) : null}
            <View style={styles.guestExploreWrap}>
              <ExploreMoreButton
                onPress={() => router.push(guestPublicTabPath.classes)}
              />
            </View>
            <GiftCardSection
              content={homeMock.giftCard}
              onBuyPress={() => router.push("/login")}
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
  feedLoading: {
    paddingVertical: space.md,
    alignItems: "center",
  },
  feedError: {
    marginHorizontal: space.screenHorizontal,
    marginBottom: space.md,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    color: colors.warmBrown,
  },
  emptyBlock: {
    marginHorizontal: space.screenHorizontal,
    marginBottom: space.section,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    color: colors.bodyMuted,
  },
});
