import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "../../../auth/SessionProvider";
import { fetchPublicPackages } from "../../../lib/api/packagesClient";
import { buildAccordionCategoriesFromPlans } from "../../../lib/packages/packagesPageCategoryData";
import type { PackagesPageAccordionCategory } from "../../../lib/packages/packagesPageCategoryData";
import { packagesCopy } from "../../../lib/packages/packagesCopy";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { PackagesPageAccordion } from "../../packages/components/PackagesPageAccordion";
import { colors, layout, space, typography } from "../../../theme/tokens";
import { PACKAGES_PAGE_MOBILE } from "../../../lib/packages/packagesPageTokens";
import { fontFamilies } from "../../../theme/fontFamilies";

export function MemberPackagesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isSignedIn } = useSession();
  const [categories, setCategories] = useState<PackagesPageAccordionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const plans = await fetchPublicPackages();
      setCategories(
        buildAccordionCategoriesFromPlans(plans, "From"),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : packagesCopy.loadError);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onSubscribePress = useCallback(() => {
    if (!isSignedIn) {
      router.push("/login");
    }
  }, [isSignedIn, router]);

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
        <Text style={styles.heading}>{packagesCopy.pageTitle}</Text>
        <Text style={styles.lead}>{packagesCopy.pageLead}</Text>

        {loading ? (
          <Text style={styles.statusText}>{packagesCopy.loading}</Text>
        ) : error !== null ? (
          <Text style={styles.error}>{error}</Text>
        ) : categories.length === 0 ? (
          <Text style={styles.statusText}>{packagesCopy.empty}</Text>
        ) : (
          <PackagesPageAccordion
            categories={categories}
            onSubscribePress={onSubscribePress}
          />
        )}
      </ScrollView>
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
