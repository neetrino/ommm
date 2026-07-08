import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { packagesCopy } from "../../../lib/packages/packagesCopy";
import type { PackagesPageAccordionCategory } from "../../../lib/packages/packagesPageCategoryData";
import {
  buildPackagesPageCardGradientColors,
  PACKAGES_PAGE_CARD,
  PACKAGES_PAGE_MOBILE,
} from "../../../lib/packages/packagesPageTokens";
import { fontFamilies } from "../../../theme/fontFamilies";
import { PackageMobileTierCard } from "./PackageMobileTierCard";

type PackageCategoryAccordionItemProps = {
  category: PackagesPageAccordionCategory;
  isExpanded: boolean;
  onToggle: () => void;
  onSubscribePress: () => void;
};

function PackagesCardFab({
  isExpanded,
  onPress,
}: {
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
        <MaterialCommunityIcons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={28}
          color={PACKAGES_PAGE_MOBILE.fabArrowColor}
        />
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

  return (
    <LinearGradient
      colors={[...gradientColors]}
      start={{ x: 0.12, y: 0 }}
      end={{ x: 0.88, y: 1 }}
      style={[styles.item, isExpanded && styles.itemExpanded]}
    >
      <View style={styles.header}>
        <View style={styles.headerBody}>
          <Text style={styles.title}>{category.label}</Text>
          {!isExpanded ? (
            <Text style={styles.details}>{packagesCopy.detailsCta}</Text>
          ) : null}
        </View>
        <PackagesCardFab isExpanded={isExpanded} onPress={onToggle} />
      </View>

      {isExpanded && category.plans.length > 0 ? (
        <View style={styles.tierList}>
          {category.plans.map((plan) => (
            <PackageMobileTierCard
              key={plan.id}
              categoryLabel={category.label}
              plan={plan}
              onSubscribePress={onSubscribePress}
            />
          ))}
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: PACKAGES_PAGE_MOBILE.collapsedCardMinHeightPx,
    borderRadius: PACKAGES_PAGE_MOBILE.collapsedCardRadiusPx,
    paddingHorizontal: 16,
    paddingLeft: 20,
    paddingVertical: 18,
    overflow: "hidden",
  },
  itemExpanded: {
    minHeight: 0,
    padding: PACKAGES_PAGE_MOBILE.expandedPanelPaddingPx,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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
    marginTop: PACKAGES_PAGE_MOBILE.tierCardGapPx,
    gap: PACKAGES_PAGE_MOBILE.tierCardGapPx,
  },
});
