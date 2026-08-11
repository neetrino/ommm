import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { useScreenChromeInsets } from "../../../components/layout/useScreenChrome";
import { useTranslations } from "../../../i18n/I18nProvider";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";
import { ManagerClientListCard } from "../components/ManagerClientListCard";
import { useManagerClientsList } from "../hooks/useManagerClientsList";

export function ManagerClientsScreen() {
  const t = useTranslations("adminPages.clients");
  const tFilters = useTranslations("adminPages.clients.filters");
  const tWaitlists = useTranslations("adminPages.waitlists");
  const { paddingTop, paddingBottom, paddingLeft, paddingRight } =
    useScreenChromeInsets({
      header: "safe",
      contentGap: space.lg,
    });
  const { searchInput, setSearchInput, state, reload, loadMore } =
    useManagerClientsList();

  return (
    <View style={styles.root}>
      <GradientBackdrop />
      <View
        style={[
          styles.chrome,
          { paddingTop, paddingLeft, paddingRight },
        ]}
      >
        <Text style={styles.title} accessibilityRole="header">
          {t("title")}
        </Text>
        <TextInput
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder={tFilters("searchPlaceholder")}
          placeholderTextColor={colors.taupe}
          style={styles.search}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          accessibilityLabel={tFilters("searchLabel")}
        />
      </View>

      {state.status === "loading" ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.taupe} />
        </View>
      ) : null}

      {state.status === "error" ? (
        <View style={[styles.centered, { paddingHorizontal: paddingLeft }]}>
          <Text style={styles.errorText}>{state.message}</Text>
          <Pressable
            onPress={reload}
            accessibilityRole="button"
            accessibilityLabel={tWaitlists("retry")}
          >
            <Text style={styles.retry}>{tWaitlists("retry")}</Text>
          </Pressable>
        </View>
      ) : null}

      {state.status === "ready" ? (
        <FlatList
          data={state.rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom,
              paddingLeft,
              paddingRight,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>{t("emptyList")}</Text>
            </View>
          }
          ListFooterComponent={
            state.loadingMore ? (
              <ActivityIndicator
                style={styles.footerSpinner}
                color={colors.taupe}
              />
            ) : null
          }
          renderItem={({ item }) => (
            <ManagerClientListCard
              row={item}
              planFallback={t("packageNoneBadge")}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  chrome: {
    gap: space.md,
    paddingBottom: space.md,
  },
  title: {
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
    fontSize: typography.sectionTitle + 6,
    lineHeight: 32,
    color: colors.primaryGreen,
  },
  search: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.creamHighlight,
    backgroundColor: colors.white,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    color: colors.primaryGreen,
  },
  listContent: {
    flexGrow: 1,
    gap: 0,
  },
  separator: {
    height: space.sm,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  errorText: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    color: colors.warmBrown,
    textAlign: "center",
  },
  retry: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    color: colors.taupe,
  },
  emptyWrap: {
    paddingVertical: space.xl,
  },
  emptyText: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    color: colors.warmBrown,
    textAlign: "center",
  },
  footerSpinner: {
    marginVertical: space.md,
  },
});
