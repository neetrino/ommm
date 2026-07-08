import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { formatMessage, type TranslationValues } from "./formatMessage";
import {
  DEFAULT_UI_LOCALE,
  type AppUiLocale,
  normalizeAppUiLocale,
} from "./locales";
import {
  pickUiLocaleForUser,
  readStoredUiLocale,
  writeStoredUiLocale,
} from "./localeStorage";
import { messagesForLocale, type MessageTree } from "./messages";
import { resolveMessage } from "./resolveMessage";
import { patchUserLocale } from "../lib/api/usersClient";

export type TranslateFn = (
  key: string,
  values?: TranslationValues,
) => string;

type I18nContextValue = {
  locale: AppUiLocale;
  messages: MessageTree;
  isReady: boolean;
  setLocale: (next: AppUiLocale, options?: SetLocaleOptions) => void;
  alignLocaleFromUser: (userLocale: string | undefined) => void;
  t: TranslateFn;
};

type SetLocaleOptions = {
  /** When false, skip AsyncStorage write (default true). */
  persist?: boolean;
  /** When true, PATCH `/users/me` locale (default true). */
  syncUser?: boolean;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function joinNamespace(namespace: string | undefined, key: string): string {
  if (namespace === undefined || namespace === "") {
    return key;
  }
  return `${namespace}.${key}`;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppUiLocale>(DEFAULT_UI_LOCALE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await readStoredUiLocale();
      if (!cancelled && stored !== null) {
        setLocaleState(stored);
      }
      if (!cancelled) {
        setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const messages = useMemo(() => messagesForLocale(locale), [locale]);

  const t = useCallback<TranslateFn>(
    (key, values) => {
      const template = resolveMessage(messages, key);
      if (template === undefined) {
        if (__DEV__) {
          console.warn(`[i18n] Missing key: ${key} (locale=${locale})`);
        }
        return key;
      }
      return formatMessage(locale, template, values);
    },
    [locale, messages],
  );

  const setLocale = useCallback(
    (next: AppUiLocale, options?: SetLocaleOptions) => {
      const normalized = normalizeAppUiLocale(next);
      setLocaleState(normalized);
      if (options?.persist !== false) {
        void writeStoredUiLocale(normalized);
      }
      if (options?.syncUser !== false) {
        void patchUserLocale(normalized).catch(() => {
          // Guest or offline — local preference is the source of truth.
        });
      }
    },
    [],
  );

  const alignLocaleFromUser = useCallback(
    (userLocale: string | undefined) => {
      const next = pickUiLocaleForUser(userLocale, locale);
      if (next === locale) {
        return;
      }
      setLocale(next, { syncUser: false });
    },
    [locale, setLocale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      messages,
      isReady,
      setLocale,
      alignLocaleFromUser,
      t,
    }),
    [alignLocaleFromUser, isReady, locale, messages, setLocale, t],
  );

  if (!isReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (ctx === null) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

/** Namespace-scoped translator — mirrors `next-intl` `useTranslations`. */
export function useTranslations(namespace?: string) {
  const { t, locale, messages } = useI18n();
  return useMemo(() => {
    const scoped: TranslateFn = (key, values) =>
      t(joinNamespace(namespace, key), values);
    return scoped;
  }, [locale, messages, namespace, t]);
}

export function useLocale(): AppUiLocale {
  return useI18n().locale;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
