import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSession } from "../../../auth/SessionProvider";
import { ScreenHeaderGapBackButton } from "../../../components/navigation/ScreenHeaderGapBackButton";
import { usePackagesCopy } from "../../../lib/packages/usePackagesCopy";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { AppHeader } from "../../../components/layout/AppHeader";
import { useAppHeaderBookPress } from "../../../components/layout/useAppHeaderBookPress";
import { useScreenChromeInsets } from "../../../components/layout/useScreenChrome";
import { PackageSubscribeSheet } from "../../packages/components/PackageSubscribeSheet";
import {
  PackagesBrowseCatalogCta,
  PackagesEmptyState,
} from "../../packages/components/PackagesScreenActions";
import { PackagesPageAccordion } from "../../packages/components/PackagesPageAccordion";
import { UserMembershipCard } from "../../packages/components/UserMembershipCard";
import {
  normalizeMembershipStatus,
  useMemberPackagesScreenState,
  type PackagesScreenMode,
} from "../hooks/useMemberPackagesScreenState";
import { colors, space, typography } from "../../../theme/tokens";
import { PACKAGES_PAGE_MOBILE } from "../../../lib/packages/packagesPageTokens";
import { SCHEDULE_PAGE_MOBILE } from "../../../lib/schedule/schedulePageTokens";
import { fontFamilies } from "../../../theme/fontFamilies";
import { scheduleColors } from "../../schedule/scheduleTokens";

const USER_PACKAGES_HREF = "/user/packages";
const USER_PACKAGES_BROWSE_HREF = "/user/packages/browse";

type MemberPackagesScreenProps = {
  /** Route-driven mode so catalog survives refresh. Defaults to catalog for public `/packages`. */
  mode?: PackagesScreenMode;
};

export function MemberPackagesScreen({ mode: modeProp }: MemberPackagesScreenProps) {
  const router = useRouter();
  const packagesCopy = usePackagesCopy();
  const { isSignedIn } = useSession();
  const mode: PackagesScreenMode =
    modeProp ?? (isSignedIn ? "mine" : "catalog");
  const showMyPackages = isSignedIn && mode === "mine";
  const showCatalog = !isSignedIn || mode === "catalog";
  const showBack = isSignedIn && showCatalog;
  const { paddingTop, paddingBottom, safePaddingLeft, safePaddingRight } =
    useScreenChromeInsets({
      includeScreenGutter: false,
      headerContentGap: showBack ? 0 : undefined,
    });
  const onHeaderBookPress = useAppHeaderBookPress();
  const {
    memberships,
    categories,
    loading,
    error,
    subscribePlanId,
    subscribeBusy,
    subscribeError,
    selectedSubscribePlan,
    load,
    openSubscribe,
    closeSubscribe,
    confirmSubscribe,
  } = useMemberPackagesScreenState({ isSignedIn, mode });

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const openCatalog = useCallback(() => {
    router.push(USER_PACKAGES_BROWSE_HREF);
  }, [router]);

  const openMine = useCallback(() => {
    router.push(USER_PACKAGES_HREF);
  }, [router]);

  const onSubscribePress = useCallback(
    (planId: string) => {
      if (!isSignedIn) {
        router.push("/login");
        return;
      }
      openSubscribe(planId);
    },
    [isSignedIn, openSubscribe, router],
  );

  const onSubscribeConfirmed = useCallback(
    async (options: { useGiftCredits: boolean }) => {
      const outcome = await confirmSubscribe(options);
      if (outcome !== "completed") {
        return;
      }
      Alert.alert(
        packagesCopy.subscribeSuccessTitle,
        packagesCopy.subscribeSuccessBody,
      );
    },
    [
      confirmSubscribe,
      packagesCopy.subscribeSuccessBody,
      packagesCopy.subscribeSuccessTitle,
    ],
  );

  const heading = showMyPackages
    ? packagesCopy.myPackagesTitle
    : packagesCopy.catalogTitle;
  const lead = showMyPackages ? packagesCopy.myPackagesLead : packagesCopy.catalogLead;

  return (
    <View style={styles.root}>
      <GradientBackdrop />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop,
            paddingBottom,
            paddingLeft:
              PACKAGES_PAGE_MOBILE.pageHorizontalPaddingPx + safePaddingLeft,
            paddingRight:
              PACKAGES_PAGE_MOBILE.pageHorizontalPaddingPx + safePaddingRight,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.pageHeader}>
          {showBack ? (
            <ScreenHeaderGapBackButton
              onPress={openMine}
              accessibilityLabel={packagesCopy.backToMyPackagesCta}
            />
          ) : null}
          <Text style={styles.heading}>{heading}</Text>
        </View>
        <Text style={styles.lead}>{lead}</Text>

        {loading ? (
          <Text style={styles.statusText}>{packagesCopy.loading}</Text>
        ) : error !== null ? (
          <Text style={styles.error}>{error}</Text>
        ) : showMyPackages ? (
          memberships.length === 0 ? (
            <View style={styles.emptyStack}>
              <PackagesBrowseCatalogCta
                label={packagesCopy.browsePackagesCta}
                onPress={openCatalog}
              />
              <PackagesEmptyState
                title={packagesCopy.noPackagesYet}
                hint={packagesCopy.emptyPackagesHint}
              />
            </View>
          ) : (
            <View style={styles.membershipList}>
              {memberships.map((membership) => (
                <UserMembershipCard
                  key={membership.id}
                  membership={membership}
                  status={normalizeMembershipStatus(membership)}
                />
              ))}
              <PackagesBrowseCatalogCta
                label={packagesCopy.browsePackagesCta}
                onPress={openCatalog}
                style={styles.browseAfterList}
              />
            </View>
          )
        ) : showCatalog ? (
          categories.length === 0 ? (
            <Text style={styles.statusText}>{packagesCopy.empty}</Text>
          ) : (
            <PackagesPageAccordion
              categories={categories}
              onSubscribePress={onSubscribePress}
            />
          )
        ) : null}
      </ScrollView>

      <AppHeader onBookPress={onHeaderBookPress} />

      <PackageSubscribeSheet
        visible={subscribePlanId !== null}
        plan={selectedSubscribePlan}
        busy={subscribeBusy}
        error={subscribeError}
        onClose={closeSubscribe}
        onConfirm={(options) => {
          void onSubscribeConfirmed(options);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    gap: space.lg,
    width: "100%",
    minWidth: 0,
  },
  pageHeader: {
    gap: 0,
  },
  heading: {
    fontFamily: fontFamilies.gtSuperDs.boldItalic,
    fontSize: SCHEDULE_PAGE_MOBILE.pageTitleSizePx,
    lineHeight: SCHEDULE_PAGE_MOBILE.pageTitleLineHeightPx,
    letterSpacing: -0.88,
    color: scheduleColors.pageTitle,
  },
  lead: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    lineHeight: 24,
    letterSpacing: 0.16,
    color: colors.bodyMuted,
    maxWidth: 576,
  },
  membershipList: {
    width: "100%",
    gap: space.md,
  },
  emptyStack: {
    width: "100%",
    alignItems: "center",
    gap: space.md,
  },
  browseAfterList: {
    marginTop: space.sm,
  },
  statusText: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.bodyMuted,
  },
  error: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.warmBrown,
  },
});
