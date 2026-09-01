import { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type View as RNView,
} from "react-native";
import { useI18n, useTranslations } from "./I18nProvider";
import {
  LANGUAGE_SWITCHER_ORDER,
  languageSwitcherEndonym,
  type LanguageSwitcherLocaleCode,
  isLanguageSwitcherLocale,
} from "./language-switcher-locales";
import { DEFAULT_UI_LOCALE } from "./locales";
import { fontFamilies } from "../theme/fontFamilies";
import { platformShadow } from "../theme/platformShadow";
import { colors, radii, space, typography } from "../theme/tokens";

const SHELL_PAD = 4;
const INDICATOR_DURATION_MS = 260;
const INDICATOR_EASING = Easing.bezier(0.4, 0, 0.2, 1);
/** Match profile logout CTA (`memberAccountHubActionTokens.logoutBtn`). */
const SELECTED_PILL_BG = "rgba(151, 144, 124, 0.92)";
const SELECTED_PILL_LABEL = "#fbf5d5";

/** Short codes for the segmented control (fits three locales cleanly). */
const LOCALE_SHORT_LABEL: Record<LanguageSwitcherLocaleCode, string> = {
  hy: "HY",
  en: "EN",
  ru: "RU",
};

/**
 * Segmented language switcher with a sliding selected pill
 * (same interaction pattern as bookings / gift-card tab navs).
 */
export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const t = useTranslations("language");

  const effectiveLocale: LanguageSwitcherLocaleCode = isLanguageSwitcherLocale(
    locale,
  )
    ? locale
    : isLanguageSwitcherLocale(DEFAULT_UI_LOCALE)
      ? DEFAULT_UI_LOCALE
      : "en";

  const trackRef = useRef<RNView>(null);
  const segmentRefs = useRef<
    Partial<Record<LanguageSwitcherLocaleCode, RNView | null>>
  >({});
  const segmentLayouts = useRef<
    Partial<Record<LanguageSwitcherLocaleCode, { x: number; width: number }>>
  >({});
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const hasPlaced = useRef(false);

  const moveIndicator = useCallback(
    (code: LanguageSwitcherLocaleCode, instant: boolean) => {
      const layout = segmentLayouts.current[code];
      if (!layout) {
        return;
      }
      if (instant || !hasPlaced.current) {
        indicatorX.setValue(layout.x);
        indicatorWidth.setValue(layout.width);
        hasPlaced.current = true;
        return;
      }
      Animated.parallel([
        Animated.timing(indicatorX, {
          toValue: layout.x,
          duration: INDICATOR_DURATION_MS,
          easing: INDICATOR_EASING,
          useNativeDriver: false,
        }),
        Animated.timing(indicatorWidth, {
          toValue: layout.width,
          duration: INDICATOR_DURATION_MS,
          easing: INDICATOR_EASING,
          useNativeDriver: false,
        }),
      ]).start();
    },
    [indicatorX, indicatorWidth],
  );

  const measureSegment = useCallback(
    (code: LanguageSwitcherLocaleCode) => {
      const node = segmentRefs.current[code];
      const track = trackRef.current;
      if (!node || !track) {
        return;
      }
      node.measureLayout(
        track,
        (x, _y, width) => {
          segmentLayouts.current[code] = { x, width };
          if (code === effectiveLocale) {
            moveIndicator(code, !hasPlaced.current);
          }
        },
        () => {
          // Next layout pass retries.
        },
      );
    },
    [effectiveLocale, moveIndicator],
  );

  useEffect(() => {
    moveIndicator(effectiveLocale, false);
  }, [effectiveLocale, moveIndicator]);

  const onTrackLayout = (_event: LayoutChangeEvent) => {
    for (const code of LANGUAGE_SWITCHER_ORDER) {
      measureSegment(code);
    }
  };

  const onSelect = useCallback(
    (next: LanguageSwitcherLocaleCode) => {
      if (next !== locale) {
        setLocale(next);
      }
    },
    [locale, setLocale],
  );

  return (
    <View
      ref={trackRef}
      collapsable={false}
      onLayout={onTrackLayout}
      style={styles.shell}
      accessibilityRole="tablist"
      accessibilityLabel={t("switcherAria")}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,
          {
            left: indicatorX,
            width: indicatorWidth,
          },
        ]}
      />
      {LANGUAGE_SWITCHER_ORDER.map((code) => {
        const selected = code === effectiveLocale;
        return (
          <Pressable
            key={code}
            ref={(node) => {
              segmentRefs.current[code] = node;
            }}
            collapsable={false}
            onLayout={() => {
              measureSegment(code);
            }}
            onPress={() => {
              onSelect(code);
            }}
            style={({ pressed }) => [
              styles.segment,
              pressed && styles.segmentPressed,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={`${t("switcherAria")}: ${languageSwitcherEndonym(code)}`}
          >
            <Text
              style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}
            >
              {LOCALE_SHORT_LABEL[code]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "relative",
    flexDirection: "row",
    alignSelf: "stretch",
    borderRadius: radii.pill,
    backgroundColor: "rgba(151, 144, 124, 0.18)",
    padding: SHELL_PAD,
    gap: 2,
  },
  indicator: {
    position: "absolute",
    top: SHELL_PAD,
    bottom: SHELL_PAD,
    borderRadius: radii.pill,
    backgroundColor: SELECTED_PILL_BG,
    zIndex: 0,
    ...platformShadow({
      color: "#2d2823",
      offsetHeight: 4,
      opacity: 0.18,
      radius: 8,
      elevation: 3,
    }),
  },
  segment: {
    flex: 1,
    minHeight: 40,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.sm,
    zIndex: 1,
    backgroundColor: "transparent",
  },
  segmentPressed: {
    opacity: 0.92,
  },
  segmentLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    letterSpacing: 0.8,
    color: colors.ink,
  },
  segmentLabelSelected: {
    color: SELECTED_PILL_LABEL,
  },
});
