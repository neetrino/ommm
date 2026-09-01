import { BlurView } from "expo-blur";
import { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import type { WaitlistItem } from "../../../lib/mocks/homeMock";
import { useTranslations } from "../../../i18n/I18nProvider";
import { fontFamilies } from "../../../theme/fontFamilies";
import { platformShadow } from "../../../theme/platformShadow";
import { colors, radii, space, typography } from "../../../theme/tokens";
import {
  WAITLIST_CARD_BLUR_INTENSITY,
  WAITLIST_DARK_GLASS_BASE,
  WAITLIST_DARK_RIM,
  WAITLIST_LIGHT_GLASS_BASE,
  WaitlistDarkGlassOverlays,
  WaitlistLightGlassOverlays,
} from "./waitlistGlassOverlays";

type WaitlistSectionProps = {
  items: WaitlistItem[];
};

const WAITLIST_CARDS_PER_PAGE = 2;

function chunkWaitlistPages(items: readonly WaitlistItem[]): WaitlistItem[][] {
  const pages: WaitlistItem[][] = [];
  for (let i = 0; i < items.length; i += WAITLIST_CARDS_PER_PAGE) {
    pages.push(items.slice(i, i + WAITLIST_CARDS_PER_PAGE));
  }
  return pages;
}

function WaitlistGlassCard({ item }: { item: WaitlistItem }) {
  const isLight = item.variant === "light";
  const radiusStyle = isLight ? styles.radiusLight : styles.radiusDark;

  return (
    <View
      style={[styles.cardFrame, radiusStyle]}
      accessibilityLabel={`${item.title} waitlist ${item.spotLabel}`}
    >
      <BlurView
        intensity={WAITLIST_CARD_BLUR_INTENSITY}
        tint={isLight ? "light" : "dark"}
        style={[
          styles.cardBlur,
          radiusStyle,
          isLight ? styles.cardBlurLight : styles.cardBlurDark,
        ]}
      >
        {isLight ? <WaitlistLightGlassOverlays /> : <WaitlistDarkGlassOverlays />}
        <View style={styles.cardInner}>
          <Text
            style={[
              styles.spotLabel,
              isLight ? styles.spotLabelLight : styles.spotLabelDark,
            ]}
          >
            {item.spotLabel}
          </Text>
          <Text
            style={[
              styles.cardTitle,
              isLight ? styles.cardTitleLight : styles.cardTitleDark,
            ]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.schedule,
              isLight ? styles.scheduleLight : styles.scheduleDark,
            ]}
            numberOfLines={1}
          >
            {item.scheduleLabel}
          </Text>
        </View>
      </BlurView>
    </View>
  );
}

export function WaitlistSection({ items }: WaitlistSectionProps) {
  const tDashboard = useTranslations("account.dashboard.waitlist");
  const { width: windowWidth } = useWindowDimensions();
  const pages = useMemo(() => chunkWaitlistPages(items), [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{tDashboard("title")}</Text>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={windowWidth}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={styles.scrollContent}
      >
        {pages.map((pageItems) => (
          <View
            key={pageItems.map((item) => item.id).join("-")}
            style={[styles.page, { width: windowWidth }]}
          >
            <View style={styles.pageRow}>
              {pageItems.map((item) => (
                <WaitlistGlassCard key={item.id} item={item} />
              ))}
              {pageItems.length === 1 ? (
                <View style={styles.cardSlotSpacer} />
              ) : null}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: space.section,
    gap: space.section,
  },
  title: {
    paddingHorizontal: space.screenHorizontal,
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
    fontSize: typography.sectionTitle,
    lineHeight: 24,
    color: colors.primaryGreen,
  },
  scrollContent: {
    paddingVertical: space.xs,
  },
  page: {
    paddingHorizontal: space.screenHorizontal,
  },
  pageRow: {
    flexDirection: "row",
    gap: space.md,
  },
  cardSlotSpacer: {
    flex: 1,
    minWidth: 0,
  },
  cardFrame: {
    flex: 1,
    minWidth: 0,
    ...platformShadow({
      color: "#e8f0fc",
      offsetHeight: 6,
      opacity: 0.48,
      radius: 16,
      elevation: 10,
    }),
  },
  radiusLight: {
    borderTopLeftRadius: radii.waitTopLeft,
    borderTopRightRadius: radii.waitTopRight,
    borderBottomLeftRadius: radii.waitTopLeft,
    borderBottomRightRadius: radii.waitTopRight,
  },
  radiusDark: {
    borderTopLeftRadius: radii.waitTopRight,
    borderTopRightRadius: radii.waitTopLeft,
    borderBottomLeftRadius: radii.waitTopRight,
    borderBottomRightRadius: radii.waitTopLeft,
  },
  cardBlur: {
    overflow: "hidden",
  },
  cardBlurLight: {
    backgroundColor: WAITLIST_LIGHT_GLASS_BASE,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
  },
  cardBlurDark: {
    backgroundColor: WAITLIST_DARK_GLASS_BASE,
    borderWidth: 1.5,
    borderColor: WAITLIST_DARK_RIM,
  },
  cardInner: {
    position: "relative",
    zIndex: 1,
    padding: space.lg,
    gap: 4.5,
  },
  spotLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.micro,
    lineHeight: 15,
    textTransform: "uppercase",
  },
  spotLabelLight: {
    color: colors.primaryGreen,
  },
  spotLabelDark: {
    color: "rgba(255,255,255,0.84)",
  },
  cardTitle: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    lineHeight: 20,
  },
  cardTitleLight: {
    color: colors.ink,
  },
  cardTitleDark: {
    color: colors.white,
  },
  schedule: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.caption,
    lineHeight: 16,
    marginTop: 3.5,
  },
  scheduleLight: {
    color: colors.bodyMuted,
  },
  scheduleDark: {
    color: colors.bodyMuted,
  },
});
