import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "../../../auth/SessionProvider";
import { CircularBackButton } from "../../../components/navigation/CircularBackButton";
import { packagesCopy } from "../../../lib/packages/packagesCopy";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { PackageSubscribeSheet } from "../../packages/components/PackageSubscribeSheet";
import {
  PackagesEmptyState,
  PackagesPrimaryCta,
} from "../../packages/components/PackagesScreenActions";
import { PackagesPageAccordion } from "../../packages/components/PackagesPageAccordion";
import { UserMembershipCard } from "../../packages/components/UserMembershipCard";
import {
  normalizeMembershipStatus,
  useMemberPackagesScreenState,
} from "../hooks/useMemberPackagesScreenState";
import { colors, layout, space, typography } from "../../../theme/tokens";
import { PACKAGES_PAGE_MOBILE } from "../../../lib/packages/packagesPageTokens";
import { fontFamilies } from "../../../theme/fontFamilies";

export function MemberPackagesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isSignedIn } = useSession();
  const {
    mode,
    memberships,
    categories,
    loading,
    error,
    subscribePlanId,
    subscribeBusy,
    subscribeError,
    selectedSubscribePlan,
    load,
    openCatalog,
    openMine,
    openSubscribe,
    closeSubscribe,
    confirmSubscribe,
  } = useMemberPackagesScreenState({ isSignedIn });

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

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

  const onSubscribeConfirmed = useCallback(async () => {
    const succeeded = await confirmSubscribe();
    if (!succeeded) {
      return;
    }
    Alert.alert(
      packagesCopy.subscribeSuccessTitle,
      packagesCopy.subscribeSuccessBody,
    );
  }, [confirmSubscribe]);

  const showMyPackages = isSignedIn && mode === "mine";
  const showCatalog = !isSignedIn || mode === "catalog";
  const heading = showMyPackages ? packagesCopy.myPackagesTitle : packagesCopy.pageTitle;
  const lead = showMyPackages ? packagesCopy.myPackagesLead : packagesCopy.catalogLead;

  const bottomPad =
    layout.tabBarHeight + Math.max(insets.bottom, space.sm) + space.xl;

  return (
    <View style={styles.root}>
      <GradientBackdrop />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        keyboardShouldPersistTaps="handled"
      >
        {isSignedIn && showCatalog ? (
          <View style={styles.backRow}>
            <CircularBackButton
              onPress={openMine}
              accessibilityLabel={packagesCopy.backToMyPackagesCta}
            />
          </View>
        ) : null}

        <Text style={styles.heading}>{heading}</Text>
        <Text style={styles.lead}>{lead}</Text>

        {isSignedIn && showMyPackages ? (
          <View style={styles.actionsRow}>
            <PackagesPrimaryCta
              label={packagesCopy.browsePackagesCta}
              onPress={openCatalog}
            />
          </View>
        ) : null}

        {loading ? (
          <Text style={styles.statusText}>{packagesCopy.loading}</Text>
        ) : error !== null ? (
          <Text style={styles.error}>{error}</Text>
        ) : showMyPackages ? (
          memberships.length === 0 ? (
            <PackagesEmptyState title={packagesCopy.noPackagesYet} />
          ) : (
            <View style={styles.membershipList}>
              {memberships.map((membership) => (
                <UserMembershipCard
                  key={membership.id}
                  membership={membership}
                  status={normalizeMembershipStatus(membership)}
                />
              ))}
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

      <PackageSubscribeSheet
        visible={subscribePlanId !== null}
        plan={selectedSubscribePlan}
        busy={subscribeBusy}
        error={subscribeError}
        onClose={closeSubscribe}
        onConfirm={() => void onSubscribeConfirmed()}
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
    paddingTop: space.lg,
    paddingHorizontal: PACKAGES_PAGE_MOBILE.pageHorizontalPaddingPx,
    gap: space.lg,
    width: "100%",
    minWidth: 0,
  },
  backRow: {
    alignSelf: "flex-start",
    marginBottom: -space.sm,
  },
  heading: {
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
    fontSize: typography.sectionTitle + 14,
    lineHeight: 40,
    letterSpacing: -0.8,
    color: colors.primaryGreen80,
  },
  lead: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    lineHeight: 24,
    letterSpacing: 0.16,
    color: colors.bodyMuted,
    maxWidth: 576,
  },
  actionsRow: {
    marginTop: -space.xs,
  },
  membershipList: {
    width: "100%",
    gap: space.md,
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
