import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { space } from "../../theme/tokens";
import {
  APP_HEADER_LOGO_SIZE,
  COMPACT_CHROME_MAX_HEIGHT,
  FLOATING_TAB_BAR_HEIGHT,
  FLOATING_TAB_BAR_HEIGHT_COMPACT,
  TAB_HIGHLIGHT_SIZE,
  TAB_HIGHLIGHT_SIZE_COMPACT,
  appHeaderScrollPaddingTop,
  tabBarScrollPaddingBottom,
} from "./screenChromeLayout";

export type ScreenChromeHeaderMode = "app" | "safe" | "none";

type UseScreenChromeInsetsOptions = {
  /** `app` = clearance for absolute AppHeader; `safe` = safe-area only; `none` = minimal. */
  header?: ScreenChromeHeaderMode;
  /** Extra gap above the floating tab bar (default `space.xl`). */
  contentGap?: number;
  /** When false, omit tab-bar occupancy from bottom padding. */
  tabBar?: boolean;
  /**
   * When true (default), horizontal padding includes `space.screenHorizontal`
   * plus left/right safe-area (needed on notched iPhone landscape).
   */
  includeScreenGutter?: boolean;
};

export function useIsCompactChrome(): boolean {
  const { width, height } = useWindowDimensions();
  return width > height || height <= COMPACT_CHROME_MAX_HEIGHT;
}

export function useIsLandscape(): boolean {
  const { width, height } = useWindowDimensions();
  return width > height;
}

/**
 * Scroll / list content insets that clear absolute AppHeader + FloatingTabBar.
 */
export function useScreenChromeInsets(
  options: UseScreenChromeInsetsOptions = {},
): {
  compact: boolean;
  isLandscape: boolean;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  /** Safe-area only (no design gutter) — for screens that already pad sections. */
  safePaddingLeft: number;
  safePaddingRight: number;
  tabBarHeight: number;
  tabHighlightSize: number;
  headerLogoSize: number;
} {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const compact = width > height || height <= COMPACT_CHROME_MAX_HEIGHT;
  const isLandscape = width > height;
  const header = options.header ?? "app";
  const contentGap = options.contentGap ?? space.xl;
  const includeTabBar = options.tabBar ?? true;
  const includeScreenGutter = options.includeScreenGutter ?? true;
  const gutter = includeScreenGutter ? space.screenHorizontal : 0;

  const paddingTop =
    header === "app"
      ? appHeaderScrollPaddingTop(insets.top)
      : header === "safe"
        ? insets.top + space.sm
        : space.sm;

  const paddingBottom = includeTabBar
    ? tabBarScrollPaddingBottom(insets.bottom, { compact, contentGap })
    : insets.bottom + contentGap;

  return {
    compact,
    isLandscape,
    paddingTop,
    paddingBottom,
    paddingLeft: insets.left + gutter,
    paddingRight: insets.right + gutter,
    safePaddingLeft: insets.left,
    safePaddingRight: insets.right,
    tabBarHeight: compact
      ? FLOATING_TAB_BAR_HEIGHT_COMPACT
      : FLOATING_TAB_BAR_HEIGHT,
    tabHighlightSize: compact
      ? TAB_HIGHLIGHT_SIZE_COMPACT
      : TAB_HIGHLIGHT_SIZE,
    headerLogoSize: APP_HEADER_LOGO_SIZE,
  };
}
