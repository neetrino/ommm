import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { readStoredAccessToken } from "../../../auth/accessTokenStorage";
import { useTranslations } from "../../../i18n/I18nProvider";
import {
  formatGiftRecipientLabel,
  searchGiftRecipients,
  type GiftMarketCard,
  type GiftRecipientOption,
} from "../../../lib/api/giftCardsClient";
import { formatAmdFromCents } from "../../../lib/formatAmd";
import { PackagesPrimaryCta } from "../../packages/components/PackagesScreenActions";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

const RECIPIENT_SEARCH_MIN_CHARS = 2;
const RECIPIENT_SEARCH_DEBOUNCE_MS = 280;

type GiftPurchaseSheetProps = {
  visible: boolean;
  card: GiftMarketCard | null;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (recipient: GiftRecipientOption) => void;
};

export function GiftPurchaseSheet({
  visible,
  card,
  busy,
  error,
  onClose,
  onConfirm,
}: GiftPurchaseSheetProps) {
  const t = useTranslations("userPages.giftCards.purchaseForm");
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<GiftRecipientOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<GiftRecipientOption | null>(null);

  useEffect(() => {
    if (!visible) {
      setQuery("");
      setDebouncedQuery("");
      setResults([]);
      setSearchError(null);
      setRecipient(null);
    }
  }, [visible]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, RECIPIENT_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length < RECIPIENT_SEARCH_MIN_CHARS) {
      setResults([]);
      setSearching(false);
      setSearchError(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const token = await readStoredAccessToken();
      if (token === null || cancelled) {
        return;
      }
      setSearching(true);
      setSearchError(null);
      try {
        const rows = await searchGiftRecipients(token, debouncedQuery);
        if (!cancelled) {
          setResults(rows);
        }
      } catch (e) {
        if (!cancelled) {
          setResults([]);
          setSearchError(
            e instanceof Error ? e.message : t("recipientSearchFailed"),
          );
        }
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, t]);

  if (card === null) {
    return null;
  }

  const canBuy = !busy && recipient !== null && card.availableQuantity > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={busy ? undefined : onClose}
          accessibilityRole="button"
        />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, space.sm) + space.lg },
          ]}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Text style={styles.title}>{formatAmdFromCents(card.amountCents)}</Text>
            <Text style={styles.lead}>{t("detailsLead")}</Text>

            <Text style={styles.sectionLabel}>{t("recipientSectionLabel")}</Text>
            <Text style={styles.hint}>{t("recipientSectionHint")}</Text>

            {recipient !== null ? (
              <View style={styles.selectedRow}>
                <Text style={styles.selectedLabel}>
                  {formatGiftRecipientLabel(recipient)}
                </Text>
                <Pressable
                  onPress={() => setRecipient(null)}
                  disabled={busy}
                  accessibilityRole="button"
                  accessibilityLabel={t("recipientRemove")}
                >
                  <Text style={styles.remove}>{t("recipientRemove")}</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={t("recipientSearchPlaceholder")}
                  placeholderTextColor={colors.bodyMuted}
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!busy}
                  accessibilityLabel={t("recipientSearchLabel")}
                />
                {query.trim().length > 0 &&
                query.trim().length < RECIPIENT_SEARCH_MIN_CHARS ? (
                  <Text style={styles.hint}>{t("recipientSearchHint")}</Text>
                ) : null}
                {searching ? (
                  <ActivityIndicator color={colors.taupe} />
                ) : null}
                {searchError !== null ? (
                  <Text style={styles.error}>{searchError}</Text>
                ) : null}
                {results.map((row) => (
                  <Pressable
                    key={row.id}
                    onPress={() => {
                      setRecipient(row);
                      setQuery("");
                      setResults([]);
                    }}
                    style={({ pressed }) => [
                      styles.resultRow,
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                  >
                    <Text style={styles.resultLabel}>
                      {formatGiftRecipientLabel(row)}
                    </Text>
                  </Pressable>
                ))}
                {!searching &&
                debouncedQuery.length >= RECIPIENT_SEARCH_MIN_CHARS &&
                results.length === 0 &&
                searchError === null ? (
                  <Text style={styles.hint}>{t("recipientEmpty")}</Text>
                ) : null}
              </>
            )}

            {error !== null ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.actions}>
              <PackagesPrimaryCta
                label={t("closeDetails")}
                onPress={onClose}
                variant="ghost"
              />
              <PackagesPrimaryCta
                label={busy ? t("loading") : t("buyAsGift")}
                onPress={() => {
                  if (canBuy && recipient !== null) {
                    onConfirm(recipient);
                  }
                }}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrimDark,
    justifyContent: "flex-end",
  },
  sheet: {
    zIndex: 1,
    maxHeight: "88%",
    borderTopLeftRadius: radii.labelCard,
    borderTopRightRadius: radii.labelCard,
    backgroundColor: colors.canvas,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
  },
  content: {
    gap: space.sm,
    paddingBottom: space.sm,
  },
  title: {
    fontFamily: fontFamilies.gtSuperDs.boldItalic,
    fontSize: typography.sectionTitle + 4,
    color: colors.primaryGreen,
  },
  lead: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    color: colors.bodyMuted,
  },
  sectionLabel: {
    marginTop: space.sm,
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.ink,
  },
  hint: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.caption,
    color: colors.bodyMuted,
  },
  input: {
    minHeight: 48,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.white,
    paddingHorizontal: space.md,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.ink,
  },
  resultRow: {
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
    borderRadius: radii.labelCard,
    backgroundColor: colors.overlayWhite35,
  },
  pressed: {
    opacity: 0.9,
  },
  resultLabel: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.ink,
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    padding: space.md,
    borderRadius: radii.labelCard,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  selectedLabel: {
    flex: 1,
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.primaryGreen,
  },
  remove: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    color: colors.danger,
  },
  error: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.danger,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    marginTop: space.md,
  },
});
