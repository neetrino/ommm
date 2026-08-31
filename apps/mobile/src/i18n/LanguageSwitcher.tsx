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
import { platformShadow } from "../theme/platformShadow";
import { colors, radii, space, typography } from "../theme/tokens";

/** Mirrors web `ommm-language-switcher-menu` + account-hub olive. */
const LANGUAGE_MENU = {
  panelRadius: 28,
  panelPadding: 16,
  panelGap: 10,
  listRadius: 20,
  listPadding: 8,
  listBg: "rgba(151, 144, 124, 0.18)",
  optionRadius: 16,
  optionMinHeight: 48,
  olive: "#97907c",
  oliveMuted: "rgba(151, 144, 124, 0.9)",
  selectedBg: "rgba(255, 255, 255, 0.72)",
  selectedBorder: "rgba(151, 144, 124, 0.85)",
  panelBorder: "rgba(255, 255, 255, 0.7)",
  backdrop: "rgba(45, 40, 35, 0.42)",
} as const;

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
        <MaterialCommunityIcons name="web" size={18} color={LANGUAGE_MENU.olive} />
        <Text
          style={[
            styles.triggerLabel,
            effectiveLocale === "hy" && styles.triggerLabelArmenian,
          ]}
        >
          {languageSwitcherEndonym(effectiveLocale)}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={18}
          color={LANGUAGE_MENU.oliveMuted}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop} accessibilityViewIsModal>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
            accessibilityRole="button"
            accessibilityLabel={t("closePicker")}
          />
          <View
            style={[
              styles.menu,
              platformShadow({
                color: "#2d2823",
                offsetHeight: 20,
                opacity: 0.22,
                radius: 28,
                elevation: 8,
              }),
            ]}
            accessibilityRole="menu"
          >
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>{t("switcherAria")}</Text>
              <Pressable
                onPress={() => setOpen(false)}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closeButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t("closePicker")}
                hitSlop={8}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color={LANGUAGE_MENU.olive}
                />
              </Pressable>
            </View>
            <View style={styles.list}>
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
                        code === "hy" && styles.optionLabelArmenian,
                        selected && styles.optionLabelSelected,
                        selected && code !== "hy" && styles.optionLabelSelectedLatin,
                      ]}
                    >
                      {languageSwitcherEndonym(code)}
                    </Text>
                    {selected ? (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color={colors.primaryGreen}
                      />
                    ) : (
                      <View style={styles.checkSpacer} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
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
  triggerLabelArmenian: {
    fontFamily: undefined,
  },
  backdrop: {
    flex: 1,
    backgroundColor: LANGUAGE_MENU.backdrop,
    justifyContent: "center",
    paddingHorizontal: space.lg,
  },
  menu: {
    zIndex: 1,
    alignSelf: "center",
    width: "100%",
    maxWidth: 340,
    borderRadius: LANGUAGE_MENU.panelRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: LANGUAGE_MENU.panelBorder,
    backgroundColor: colors.canvas,
    padding: LANGUAGE_MENU.panelPadding,
    gap: LANGUAGE_MENU.panelGap,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    paddingLeft: space.xs,
    paddingTop: space.xxs,
  },
  menuTitle: {
    flex: 1,
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: LANGUAGE_MENU.olive,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(151, 144, 124, 0.16)",
  },
  closeButtonPressed: {
    opacity: 0.85,
  },
  list: {
    borderRadius: LANGUAGE_MENU.listRadius,
    backgroundColor: LANGUAGE_MENU.listBg,
    padding: LANGUAGE_MENU.listPadding,
    gap: space.xxs,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: LANGUAGE_MENU.optionMinHeight,
    borderRadius: LANGUAGE_MENU.optionRadius,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  optionSelected: {
    backgroundColor: LANGUAGE_MENU.selectedBg,
    borderColor: LANGUAGE_MENU.selectedBorder,
  },
  optionPressed: {
    opacity: 0.92,
  },
  optionLabel: {
    flex: 1,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    lineHeight: 22,
    color: colors.ink,
  },
  /**
   * Manrope has no Armenian glyphs — forcing it falls back to a serif system
   * face. Omit custom family so the platform sans (Noto / SF Armenian) is used.
   */
  optionLabelArmenian: {
    fontFamily: undefined,
  },
  optionLabelSelected: {
    color: colors.primaryGreen,
  },
  optionLabelSelectedLatin: {
    fontFamily: fontFamilies.manrope.semiBold,
  },
  checkSpacer: {
    width: 20,
    height: 20,
  },
});
