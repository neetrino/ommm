import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSession } from "../../../auth/SessionProvider";
import { userMemberPath } from "../../../navigation/memberPaths";
import { AppHeader } from "../../../components/layout/AppHeader";
import { useAppHeaderBookPress } from "../../../components/layout/useAppHeaderBookPress";
import { useScreenChromeInsets } from "../../../components/layout/useScreenChrome";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { colors, space, typography } from "../../../theme/tokens";
import { fontFamilies } from "../../../theme/fontFamilies";
import { ExploreMoreButton } from "../components/ExploreMoreButton";
import { ExploreSection } from "../components/ExploreSection";
import { GiftCardSection } from "../components/GiftCardSection";
import { NextClassSection } from "../components/NextClassSection";
import { UserGreetingSection } from "../components/UserGreetingSection";
import { WaitlistSection } from "../components/WaitlistSection";
import { useHomeGiftContent } from "../hooks/useHomeContent";
import { useMemberHomeFeed } from "../hooks/useMemberHomeFeed";

export function HomeScreen() {
  const router = useRouter();
  const { userGreetingName, homeImageUri, profileInitials } = useSession();
  const giftContent = useHomeGiftContent();
  const feed = useMemberHomeFeed();
  const { paddingTop, paddingBottom, safePaddingLeft, safePaddingRight } =
    useScreenChromeInsets({ includeScreenGutter: false });
  const onHeaderBookPress = useAppHeaderBookPress();

  return (
    <View style={styles.root}>
      <GradientBackdrop />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop,
            paddingBottom,
            paddingLeft: safePaddingLeft,
            paddingRight: safePaddingRight,
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
                onAllEventsPress={() => router.push(userMemberPath("schedule"))}
                onOpenClassPress={() => router.push(userMemberPath("classes"))}
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
