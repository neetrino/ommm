import { useCallback, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslations, useI18n } from "./I18nProvider";
import {
  LANGUAGE_SWITCHER_ORDER,
  languageSwitcherEndonym,
  type LanguageSwitcherLocaleCode,
  isLanguageSwitcherLocale,
} from "./language-switcher-locales";
import { DEFAULT_UI_LOCALE } from "./locales";
import { fontFamilies } from "../theme/fontFamilies";
import { colors, radii, space, typography } from "../theme/tokens";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const t = useTranslations("language");
  const [open, setOpen] = useState(false);

  const effectiveLocale: LanguageSwitcherLocaleCode = isLanguageSwitcherLocale(locale)
    ? locale
    : isLanguageSwitcherLocale(DEFAULT_UI_LOCALE)
      ? DEFAULT_UI_LOCALE
      : "en";

  const onSelect = useCallback(
    (next: LanguageSwitcherLocaleCode) => {
      setOpen(false);
      if (next !== locale) {
        setLocale(next);
      }
    },
    [locale, setLocale],
  );

  const triggerLabel = `${t("switcherAria")}: ${languageSwitcherEndonym(effectiveLocale)}`;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
        accessibilityRole="button"
        accessibilityLabel={triggerLabel}
      >
        <MaterialCommunityIcons name="web" size={18} color={colors.primaryGreen} />
        <Text style={styles.triggerLabel}>{languageSwitcherEndonym(effectiveLocale)}</Text>
        <MaterialCommunityIcons name="chevron-down" size={18} color={colors.secondarySage} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.menu} accessibilityRole="menu">
            <Text style={styles.menuTitle}>{t("switcherAria")}</Text>
            {LANGUAGE_SWITCHER_ORDER.map((code) => {
              const selected = code === effectiveLocale;
              return (
                <Pressable
                  key={code}
                  onPress={() => onSelect(code)}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      selected && styles.optionLabelSelected,
                    ]}
                  >
                    {languageSwitcherEndonym(code)}
                  </Text>
                  {selected ? (
                    <MaterialCommunityIcons
                      name="check"
                      size={18}
                      color={colors.primaryGreen}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.glassBorder,
    backgroundColor: colors.overlayWhite38,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  triggerPressed: {
    opacity: 0.88,
  },
  triggerLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.primaryGreen,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: space.xl,
  },
  menu: {
    borderRadius: radii.labelCard,
    backgroundColor: colors.white,
    padding: space.md,
    gap: space.xs,
  },
  menuTitle: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.bodyMuted,
    marginBottom: space.xs,
    paddingHorizontal: space.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radii.labelCard,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
  },
  optionSelected: {
    backgroundColor: colors.overlayWhite38,
  },
  optionPressed: {
    opacity: 0.9,
  },
  optionLabel: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    color: colors.ink,
  },
  optionLabelSelected: {
    fontFamily: fontFamilies.manrope.semiBold,
    color: colors.primaryGreen,
  },
});
