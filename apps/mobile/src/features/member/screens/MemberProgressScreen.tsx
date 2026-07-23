import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { readStoredAccessToken } from "../../../auth/accessTokenStorage";
import { fetchMemberMe, type MemberMePayload } from "../../../lib/api/memberClient";
import { useLocale, useTranslations } from "../../../i18n/I18nProvider";
import { intlLocaleTag } from "../../../i18n/locales";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { useScreenChromeInsets } from "../../../components/layout/useScreenChrome";
import { colors, space, typography } from "../../../theme/tokens";
import { fontFamilies } from "../../../theme/fontFamilies";

export function MemberProgressScreen() {
  const locale = useLocale();
  const intlLocale = intlLocaleTag(locale);
  const tProgress = useTranslations("userPages.progress");
  const tDashboard = useTranslations("account.dashboard");
  const { paddingTop, paddingBottom, paddingLeft, paddingRight } =
    useScreenChromeInsets({
      header: "safe",
    });
  const [data, setData] = useState<MemberMePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const token = await readStoredAccessToken();
      if (token === null) {
        setData(null);
        return;
      }
      const me = await fetchMemberMe(token);
      setData(me);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : tDashboard("waitlist.error"),
      );
      setData(null);
    }
  }, [tDashboard]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <View style={styles.root}>
      <GradientBackdrop />
      <FlatList
        data={data?.achievements ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingTop, paddingBottom, paddingLeft, paddingRight },
        ]}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={styles.title}>{tProgress("title")}</Text>
            {error !== null ? <Text style={styles.error}>{error}</Text> : null}
            {data !== null && data.achievements.length === 0 ? (
              <Text style={styles.meta}>{tProgress("achievementsEmpty")}</Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
            <Text style={styles.cardDate}>
              {tProgress("unlocked", {
                date: new Date(item.unlockedAt).toLocaleDateString(intlLocale),
              })}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  headerBlock: {
    gap: space.sm,
    marginBottom: space.md,
  },
  title: {
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
    fontSize: typography.sectionTitle,
    color: colors.primaryGreen80,
  },
  meta: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.bodyMuted,
  },
  error: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.warmBrown,
  },
  list: {
    gap: space.md,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.white,
    padding: space.lg,
    gap: space.xs,
  },
  cardTitle: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    color: colors.ink,
  },
  cardDesc: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.caption,
    color: colors.bodyMuted,
  },
  cardDate: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.micro,
    color: colors.warmBrown,
  },
});
