import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ScreenHeaderGapBackButton } from "../../../components/navigation/ScreenHeaderGapBackButton";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { AppHeader } from "../../../components/layout/AppHeader";
import { useAppHeaderBookPress } from "../../../components/layout/useAppHeaderBookPress";
import { useScreenChromeInsets } from "../../../components/layout/useScreenChrome";
import { useTranslations } from "../../../i18n/I18nProvider";
import { formatAmdFromCents } from "../../../lib/formatAmd";
import { SCHEDULE_PAGE_MOBILE } from "../../../lib/schedule/schedulePageTokens";
import { scheduleColors } from "../../schedule/scheduleTokens";
import { PackagesPrimaryCta } from "../../packages/components/PackagesScreenActions";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, space, typography } from "../../../theme/tokens";
import { GiftCardsTabNav } from "../components/GiftCardsTabNav";
import { GiftMarketCardTile } from "../components/GiftMarketCardTile";
import { GiftMyCardTile } from "../components/GiftMyCardTile";
import { GiftPurchaseSheet } from "../components/GiftPurchaseSheet";
import { GiftRedeemForm } from "../components/GiftRedeemForm";
import {
  useMemberGiftCardsScreenState,
  type GiftCardsTab,
} from "../hooks/useMemberGiftCardsScreenState";

function parseInitialTab(value: string | string[] | undefined): GiftCardsTab {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "shop" ? "shop" : "my";
}

export function MemberGiftCardsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const t = useTranslations("userPages.giftCards");
  const tPurchase = useTranslations("userPages.giftCards.purchaseForm");
  const tRetry = useTranslations("adminPages.classes.classTypes");
  const state = useMemberGiftCardsScreenState({
    initialTab: parseInitialTab(params.tab),
  });
  const { paddingTop, paddingBottom, safePaddingLeft, safePaddingRight } =
    useScreenChromeInsets({
      includeScreenGutter: false,
      headerContentGap: 0,
    });
  const onHeaderBookPress = useAppHeaderBookPress();

  const statusLabels = useMemo(
    () => ({
      ACTIVE: t("statusValues.ACTIVE"),
      REDEEMED: t("statusValues.REDEEMED"),
      EXPIRED: t("statusValues.EXPIRED"),
      DEACTIVATED: t("statusValues.DEACTIVATED"),
    }),
    [t],
  );

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
            paddingLeft: space.md + safePaddingLeft,
            paddingRight: space.md + safePaddingRight,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.pageHeader}>
          <ScreenHeaderGapBackButton
            onPress={() => router.back()}
            accessibilityLabel={t("title")}
          />
          <Text style={styles.title}>{t("title")}</Text>
        </View>

        {state.balanceCents !== null ? (
          <Text style={styles.balance}>
            {t("giftBalanceLabel")}: {formatAmdFromCents(state.balanceCents)}
          </Text>
        ) : null}

        <GiftCardsTabNav
          myLabel={t("tabs.my")}
          shopLabel={t("tabs.shop")}
          ariaLabel={t("tabs.aria")}
          activeTab={state.tab}
          onTabChange={state.setTab}
        />

        {state.loading ? (
          <ActivityIndicator size="large" color={colors.taupe} />
        ) : state.error !== null ? (
          <View style={styles.errorBlock}>
            <Text style={styles.error}>{state.error}</Text>
            <PackagesPrimaryCta
              label={tRetry("retryButton")}
              onPress={() => void state.reload()}
              variant="ghost"
            />
          </View>
        ) : state.tab === "shop" ? (
          <View style={styles.list}>
            <Text style={styles.sectionHeading}>{t("marketHeading")}</Text>
            {state.market.length === 0 ? (
              <Text style={styles.empty}>{tPurchase("empty")}</Text>
            ) : (
              state.market.map((card) => (
                <GiftMarketCardTile
                  key={card.id}
                  card={card}
                  availableLabel={tPurchase("availableShort")}
                  onPress={() => state.openCard(card.id)}
                  disabled={state.buyBusy}
                />
              ))
            )}
          </View>
        ) : (
          <View style={styles.list}>
            <GiftRedeemForm
              code={state.redeemCode}
              onChangeCode={state.setRedeemCode}
              busy={state.redeemBusy}
              message={state.redeemMessage}
              onSubmit={() => void state.onRedeem()}
            />
            <Text style={styles.sectionHeading}>{t("myCardsHeading")}</Text>
            {state.myCards.length === 0 ? (
              <Text style={styles.empty}>{t("emptyMyDescription")}</Text>
            ) : (
              state.myCards.map(({ card, source }) => (
                <GiftMyCardTile
                  key={`${source}-${card.id}`}
                  card={card}
                  sourceLabel={t(`sourceLabels.${source}`)}
                  balanceLabel={t("cardBalance")}
                  codeLabel={t("cardCode")}
                  statusLabel={
                    statusLabels[card.status as keyof typeof statusLabels] ??
                    card.status
                  }
                />
              ))
            )}
          </View>
        )}
      </ScrollView>

      <AppHeader onBookPress={onHeaderBookPress} />

      <GiftPurchaseSheet
        visible={state.selectedCard !== null}
        card={state.selectedCard}
        busy={state.buyBusy}
        error={state.buyError}
        onClose={state.closeCard}
        onConfirm={(recipient) => {
          void state.confirmBuy(recipient);
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
  },
  pageHeader: {
    gap: 0,
  },
  title: {
    fontFamily: fontFamilies.gtSuperDs.boldItalic,
    fontSize: SCHEDULE_PAGE_MOBILE.pageTitleSizePx,
    lineHeight: SCHEDULE_PAGE_MOBILE.pageTitleLineHeightPx,
    letterSpacing: -0.88,
    color: scheduleColors.pageTitle,
  },
  balance: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.primaryGreen,
  },
  list: {
    gap: space.md,
  },
  sectionHeading: {
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
    fontSize: typography.sectionTitle,
    color: scheduleColors.pageTitle,
  },
  empty: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.bodyMuted,
  },
  errorBlock: {
    gap: space.sm,
  },
  error: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.danger,
  },
});
