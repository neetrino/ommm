import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, shadows, space, typography } from "../../../theme/tokens";
import { homeMarketingCopy } from "../content/homeMarketingCopy";

const CARD_GAP = 20;
const CARD_MIN_WIDTH = 158;

export type HighlightCardKey = "schedule" | "memberships" | "journal";

type HomeHighlightsSectionProps = {
  onCardPress: (key: HighlightCardKey) => void;
};

export function HomeHighlightsSection({ onCardPress }: HomeHighlightsSectionProps) {
  const { width } = useWindowDimensions();
  const horizontal = space.screenHorizontal;
  const usable = width - horizontal * 2;
  const twoCol = usable >= CARD_MIN_WIDTH * 2 + CARD_GAP;
  const halfCardW = (usable - CARD_GAP) / 2;

  return (
    <View style={[styles.wrap, { paddingHorizontal: horizontal }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{homeMarketingCopy.highlights.title}</Text>
        <Text style={styles.lead}>{homeMarketingCopy.highlights.lead}</Text>
      </View>

      <View style={[styles.grid, { gap: CARD_GAP }]}>
        {homeMarketingCopy.highlights.cards.map((item, index) => {
          const cardWidthStyle =
            !twoCol || (twoCol && index === 2)
              ? ({ width: "100%" as const } as const)
              : ({ width: halfCardW } as const);
          return (
            <Pressable
              key={item.key}
              onPress={() => onCardPress(item.key)}
              style={({ pressed }) => [
                styles.card,
                cardWidthStyle,
                pressed && styles.cardPressed,
                shadows.bookingCard,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}. ${homeMarketingCopy.highlights.cta}`}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody}>{item.body}</Text>
              <Text style={styles.cardCta}>
                {homeMarketingCopy.highlights.cta}
                <Text style={styles.cardArrow}> →</Text>
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: space.lg,
    paddingBottom: space.section,
    backgroundColor: colors.overlayWhite35,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  header: {
    alignItems: "center",
    paddingBottom: space.lg,
    maxWidth: 520,
    alignSelf: "center",
  },
  title: {
    fontFamily: fontFamilies.newsreader.semiBold,
    fontSize: typography.sectionTitle + 6,
    lineHeight: 30,
    color: colors.primaryGreen,
    textAlign: "center",
  },
  lead: {
    marginTop: space.sm,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 22,
    color: colors.secondarySage,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    backgroundColor: colors.overlayWhite40,
    padding: space.lg,
    minHeight: 168,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardTitle: {
    fontFamily: fontFamilies.newsreader.semiBold,
    fontSize: typography.body + 2,
    lineHeight: 26,
    color: colors.primaryGreen,
  },
  cardBody: {
    marginTop: space.sm,
    flex: 1,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.caption + 1,
    lineHeight: 20,
    color: colors.bodyMuted,
  },
  cardCta: {
    marginTop: space.lg,
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.taupeButton,
  },
  cardArrow: {
    fontFamily: fontFamilies.manrope.semiBold,
  },
});
