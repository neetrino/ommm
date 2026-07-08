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
import { AppHeader } from "../../../components/layout/AppHeader";
import { appHeaderScrollPaddingTop } from "../../../components/layout/appHeaderLayout";
import { useAppHeaderBookPress } from "../../../components/layout/useAppHeaderBookPress";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { colors, layout, space, typography } from "../../../theme/tokens";
import { fontFamilies } from "../../../theme/fontFamilies";
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
import {
  useHomeGiftContent,
  useHomeMarketingCopy,
} from "../hooks/useHomeContent";
import { useMemberHomeFeed } from "../hooks/useMemberHomeFeed";

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isSignedIn, userGreetingName, homeImageUri, profileInitials } = useSession();
  const homeCopy = useHomeMarketingCopy();
  const giftContent = useHomeGiftContent();
  const feed = useMemberHomeFeed(isSignedIn);

  const headerOffset = appHeaderScrollPaddingTop(insets.top);
  const bottomPad =
    layout.tabBarHeight + Math.max(insets.bottom, space.sm) + space.xl;
  const onHeaderBookPress = useAppHeaderBookPress();

  return (
    <View style={styles.root}>
      <GradientBackdrop />

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
              avatarInitials={profileInitials}
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
                ) : null}
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
              content={giftContent}
              onBuyPress={() => router.push(userMemberPath("packages"))}
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
                if (key === "packages") {
                  router.push(guestPublicTabPath.packages);
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
              content={giftContent}
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
});
