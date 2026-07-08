import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import type { PackagesPageAccordionCategory } from "../../../lib/packages/packagesPageCategoryData";
import { PACKAGES_PAGE_MOBILE } from "../../../lib/packages/packagesPageTokens";
import { PackageCategoryAccordionItem } from "./PackageCategoryAccordionItem";

type PackagesPageAccordionProps = {
  categories: readonly PackagesPageAccordionCategory[];
  onSubscribePress: () => void;
};

export function PackagesPageAccordion({
  categories,
  onSubscribePress,
}: PackagesPageAccordionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const onToggle = useCallback((categoryId: string) => {
    setExpandedId((current) => (current === categoryId ? null : categoryId));
  }, []);

  return (
    <View style={styles.stack}>
      {categories.map((category) => (
        <PackageCategoryAccordionItem
          key={category.id}
          category={category}
          isExpanded={expandedId === category.id}
          onToggle={() => onToggle(category.id)}
          onSubscribePress={onSubscribePress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    width: "100%",
    minWidth: 0,
    gap: PACKAGES_PAGE_MOBILE.accordionGapPx,
  },
});
