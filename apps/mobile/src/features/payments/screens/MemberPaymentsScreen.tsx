import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CircularBackButton } from "../../../components/navigation/CircularBackButton";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { AppHeader } from "../../../components/layout/AppHeader";
import { useAppHeaderBookPress } from "../../../components/layout/useAppHeaderBookPress";
import { useScreenChromeInsets } from "../../../components/layout/useScreenChrome";
import { useLocale, useTranslations } from "../../../i18n/I18nProvider";
import { intlLocaleTag } from "../../../i18n/locales";
import { SCHEDULE_PAGE_MOBILE } from "../../../lib/schedule/schedulePageTokens";
import { PackagesPrimaryCta } from "../../packages/components/PackagesScreenActions";
import { scheduleColors } from "../../schedule/scheduleTokens";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, space, typography } from "../../../theme/tokens";
import { PaymentHistoryCard } from "../components/PaymentHistoryCard";
import { useMemberPaymentsScreenState } from "../hooks/useMemberPaymentsScreenState";

export function MemberPaymentsScreen() {
  const router = useRouter();
  const locale = useLocale();
  const intlLocale = intlLocaleTag(locale);
  const t = useTranslations("userPages.payments");
  const tRetry = useTranslations("adminPages.classes.classTypes");
  const state = useMemberPaymentsScreenState();
  const { paddingTop, paddingBottom, safePaddingLeft, safePaddingRight } =
    useScreenChromeInsets({ includeScreenGutter: false });
  const onHeaderBookPress = useAppHeaderBookPress();

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
        refreshControl={
          <RefreshControl
            refreshing={state.refreshing}
            onRefresh={state.refresh}
            tintColor={colors.taupe}
          />
        }
      >
        <View style={styles.backRow}>
          <CircularBackButton
            onPress={() => router.back()}
            accessibilityLabel={t("title")}
          />
        </View>

        <Text style={styles.title}>{t("title")}</Text>

        {state.loading ? (
          <ActivityIndicator size="large" color={colors.taupe} />
        ) : null}

        {!state.loading && state.error !== null ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyTitle}>{t("unexpectedErrorTitle")}</Text>
            <Text style={styles.emptyBody}>{state.error}</Text>
            <PackagesPrimaryCta
              label={tRetry("retry")}
              onPress={state.reload}
              variant="ghost"
            />
          </View>
        ) : null}

        {!state.loading && state.error === null && state.items.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyTitle}>{t("emptyTitle")}</Text>
            <Text style={styles.emptyBody}>{t("emptyDescription")}</Text>
          </View>
        ) : null}

        {!state.loading && state.error === null && state.items.length > 0 ? (
          <View style={styles.list}>
            <Text style={styles.count}>
              {t("paymentsCount", { count: state.total })}
            </Text>
            {state.items.map((payment) => (
              <PaymentHistoryCard
                key={payment.id}
                payment={payment}
                locale={intlLocale}
                t={t}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
      <AppHeader onBookPress={onHeaderBookPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    flexGrow: 1,
    gap: space.md,
    paddingBottom: space.xxl,
  },
  backRow: {
    alignSelf: "flex-start",
  },
  title: {
    fontFamily: fontFamilies.gtSuperDs.boldItalic,
    fontSize: SCHEDULE_PAGE_MOBILE.pageTitleSizePx,
    lineHeight: SCHEDULE_PAGE_MOBILE.pageTitleLineHeightPx,
    letterSpacing: -0.88,
    color: scheduleColors.pageTitle,
  },
  count: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.bodyMuted,
  },
  list: {
    gap: space.md,
  },
  emptyBlock: {
    gap: space.sm,
    paddingVertical: space.lg,
  },
  emptyTitle: {
    fontFamily: fontFamilies.gtSuperDs.medium,
    fontSize: typography.sectionTitle,
    color: colors.ink,
  },
  emptyBody: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    color: colors.bodyMuted,
  },
});
