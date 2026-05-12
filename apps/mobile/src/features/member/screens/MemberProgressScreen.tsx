import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { readStoredAccessToken } from "../../../auth/accessTokenStorage";
import { fetchMemberMe, type MemberMePayload } from "../../../lib/api/memberClient";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { colors, space, typography } from "../../../theme/tokens";
import { fontFamilies } from "../../../theme/fontFamilies";

export function MemberProgressScreen() {
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
      setError(e instanceof Error ? e.message : "Could not load progress");
      setData(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <View style={styles.root}>
      <GradientBackdrop />
      <Text style={styles.title}>Progress</Text>
      {error !== null ? <Text style={styles.error}>{error}</Text> : null}
      {data !== null && data.achievements.length === 0 ? (
        <Text style={styles.meta}>No achievements yet — keep training.</Text>
      ) : null}
      {data !== null && data.achievements.length > 0 ? (
        <FlatList
          data={data.achievements}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
              <Text style={styles.cardDate}>
                {new Date(item.unlockedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  title: {
    marginTop: space.lg,
    marginHorizontal: space.screenHorizontal,
    fontFamily: fontFamilies.newsreader.semiBoldItalic,
    fontSize: typography.sectionTitle,
    color: colors.primaryGreen80,
  },
  meta: {
    marginHorizontal: space.screenHorizontal,
    marginTop: space.md,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.bodyMuted,
  },
  error: {
    marginHorizontal: space.screenHorizontal,
    marginTop: space.sm,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.warmBrown,
  },
  list: {
    paddingHorizontal: space.screenHorizontal,
    paddingTop: space.md,
    paddingBottom: space.xxl,
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
