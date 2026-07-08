import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { packagesCopy } from "../../../lib/packages/packagesCopy";
import type { PackagesPageAccordionCategory } from "../../../lib/packages/packagesPageCategoryData";
import {
  buildPackagesPageCardGradientColors,
  PACKAGES_PAGE_CARD,
  PACKAGES_PAGE_MOBILE,
} from "../../../lib/packages/packagesPageTokens";
import type { PublicPackagePlan } from "../../../lib/packages/publicPackagePlan";
import { fontFamilies } from "../../../theme/fontFamilies";
import { usePackageCategoryAccordionAnimation } from "../hooks/usePackageCategoryAccordionAnimation";
import { PackageMobileTierCard } from "./PackageMobileTierCard";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

type PackageCategoryAccordionItemProps = {
  category: PackagesPageAccordionCategory;
  isExpanded: boolean;
  onToggle: () => void;
  onSubscribePress: (planId: string) => void;
};

function PackageTierList({
  categoryLabel,
  plans,
  onSubscribePress,
}: {
  categoryLabel: string;
  plans: readonly PublicPackagePlan[];
  onSubscribePress: (planId: string) => void;
}) {
  return (
    <View style={styles.tierList}>
      {plans.map((plan) => (
        <PackageMobileTierCard
          key={plan.id}
          categoryLabel={categoryLabel}
          plan={plan}
          onSubscribePress={onSubscribePress}
        />
      ))}
    </View>
  );
}

function PackagesCardFab({
  rotation,
  isExpanded,
  onPress,
}: {
  rotation: Animated.AnimatedInterpolation<string>;
  isExpanded: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.fabPressable, pressed && styles.fabPressed]}
      accessibilityRole="button"
      accessibilityState={{ expanded: isExpanded }}
    >
      <View style={styles.fabCircle}>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <MaterialCommunityIcons
            name="chevron-right"
            size={28}
            color={PACKAGES_PAGE_MOBILE.fabArrowColor}
          />
        </Animated.View>
      </View>
    </Pressable>
  );
}

export function PackageCategoryAccordionItem({
  category,
  isExpanded,
  onToggle,
  onSubscribePress,
}: PackageCategoryAccordionItemProps) {
  const gradientColors = buildPackagesPageCardGradientColors(category.gradientStartColor);
  const animation = usePackageCategoryAccordionAnimation(isExpanded);
  const hasPlans = category.plans.length > 0;

  return (
    <AnimatedLinearGradient
      colors={[...gradientColors]}
      start={{ x: 0.12, y: 0 }}
      end={{ x: 0.88, y: 1 }}
      style={[
        styles.item,
        {
          width: "100%",
          paddingTop: animation.animatedPaddingVertical,
          paddingBottom: animation.animatedPaddingVertical,
          paddingRight: animation.animatedPaddingRight,
          paddingLeft: animation.animatedPaddingLeft,
          minHeight: isExpanded ? undefined : PACKAGES_PAGE_MOBILE.collapsedCardMinHeightPx,
        },
      ]}
    >
      <View style={[styles.header, isExpanded && styles.headerExpanded]}>
        <View style={styles.headerBody}>
          <Text style={styles.title}>{category.label}</Text>
          <Animated.View
            style={{
              height: animation.animatedDetailsHeight,
              opacity: animation.animatedDetailsOpacity,
              marginTop: animation.animatedDetailsMarginTop,
              overflow: "hidden",
            }}
          >
            <Text style={styles.details}>{packagesCopy.detailsCta}</Text>
          </Animated.View>
        </View>
        <PackagesCardFab
          rotation={animation.animatedFabRotation}
          isExpanded={isExpanded}
          onPress={onToggle}
        />
      </View>

      {hasPlans ? (
        <>
          <Animated.View
            style={{
              width: "100%",
              minWidth: 0,
              height: animation.animatedContentHeight,
              overflow: "hidden",
            }}
          >
            <Animated.View
              style={{
                width: "100%",
                minWidth: 0,
                opacity: animation.animatedContentOpacity,
                paddingTop: animation.animatedContentPaddingTop,
              }}
            >
              <PackageTierList
                categoryLabel={category.label}
                plans={category.plans}
                onSubscribePress={onSubscribePress}
              />
            </Animated.View>
          </Animated.View>

          <View
            pointerEvents="none"
            style={styles.measurementHost}
            onLayout={animation.onContentLayout}
          >
            <PackageTierList
              categoryLabel={category.label}
              plans={category.plans}
              onSubscribePress={onSubscribePress}
            />
          </View>
        </>
      ) : null}
    </AnimatedLinearGradient>
  );
}

const styles = StyleSheet.create({
  item: {
    width: "100%",
    minWidth: 0,
    borderRadius: PACKAGES_PAGE_MOBILE.collapsedCardRadiusPx,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    width: "100%",
    minWidth: 0,
  },
  headerExpanded: {
    alignItems: "flex-start",
  },
  headerBody: {
    flex: 1,
    minWidth: 0,
    justifyContent: "space-between",
    gap: 12,
    alignSelf: "stretch",
  },
  title: {
    fontFamily: fontFamilies.gtSuperDs.boldItalic,
    fontSize: PACKAGES_PAGE_MOBILE.collapsedTitleSizePx,
    lineHeight: 30,
    letterSpacing: -0.56,
    color: PACKAGES_PAGE_CARD.textColor,
  },
  details: {
    fontFamily: fontFamilies.gtSuperDs.boldItalic,
    fontSize: PACKAGES_PAGE_MOBILE.collapsedDetailsSizePx,
    lineHeight: 19,
    color: PACKAGES_PAGE_CARD.textColor,
  },
  fabPressable: {
    width: PACKAGES_PAGE_MOBILE.mobileFabSizePx,
    height: PACKAGES_PAGE_MOBILE.mobileFabSizePx,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  fabPressed: {
    opacity: 0.88,
  },
  fabCircle: {
    width: PACKAGES_PAGE_MOBILE.mobileFabSizePx,
    height: PACKAGES_PAGE_MOBILE.mobileFabSizePx,
    borderRadius: PACKAGES_PAGE_MOBILE.mobileFabSizePx / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `rgba(40, 40, 40, ${PACKAGES_PAGE_MOBILE.fabFillOpacity})`,
  },
  tierList: {
    width: "100%",
    minWidth: 0,
    gap: PACKAGES_PAGE_MOBILE.tierCardGapPx,
  },
  measurementHost: {
    position: "absolute",
    left: 0,
    right: 0,
    width: "100%",
    opacity: 0,
    zIndex: -1,
  },
});
