import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  authLogout,
  authLogin,
  authRegister,
  fetchSessionUser,
  type AuthUserSummary,
} from "../lib/api/authClient";
import { getApiBaseUrl } from "../lib/api/config";
import { resolveApiAssetUrl } from "../lib/api/assetUrl";
import {
  clearStoredAccessToken,
  persistAccessToken,
  readStoredAccessToken,
} from "./accessTokenStorage";
import { SESSION_STORAGE_KEY } from "./persistedSession";
import { homeHrefForRole } from "./roleHome";
import { sessionGreetingDisplayName } from "./sessionGreetingDisplayName";
import { buildProfileInitials } from "../features/profile/profileInitials";
import { useI18n } from "../i18n/I18nProvider";
import { writeStoredUiLocale } from "../i18n/localeStorage";
import { pickUiLocaleForUser } from "../i18n/localeStorage";
import type { AppUiLocale } from "../i18n/locales";

type SessionContextValue = {
  isReady: boolean;
  isSignedIn: boolean;
  /** API role string when signed in (e.g. `USER`, `ADMIN`). */
  role: string | null;
  /** Default home for the current role; meaningful when `isSignedIn`. */
  homeHref: string;
  /** Greeting line (name or email local-part); empty when signed out. */
  userGreetingName: string;
  /** Account email when signed in. */
  userEmail: string;
  /** Resolved absolute URI for custom Home image, or null. */
  homeImageUri: string | null;
  /** Initials from name/surname when no custom photo is set. */
  profileInitials: string;
  refreshProfile: () => Promise<void>;
  establishSession: (accessToken: string, user?: AuthUserSummary) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<string>;
  registerAccount: (params: {
    email: string;
    password: string;
    name: string;
    lastName: string;
    phone: string;
    locale?: AppUiLocale;
  }) => Promise<string>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

async function clearLegacySignedInFlag(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Non-fatal migration cleanup.
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const { locale, alignLocaleFromUser } = useI18n();
  const [isReady, setIsReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [sessionProfile, setSessionProfile] = useState<AuthUserSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await clearLegacySignedInFlag();
      try {
        getApiBaseUrl();
      } catch {
        if (!cancelled) {
          setIsSignedIn(false);
          setSessionProfile(null);
          setIsReady(true);
        }
        return;
      }
      const token = await readStoredAccessToken();
      if (token === null) {
        if (!cancelled) {
          setIsSignedIn(false);
          setSessionProfile(null);
          setIsReady(true);
        }
        return;
      }
      try {
        const user = await fetchSessionUser(token);
        if (!cancelled) {
          setSessionProfile(user);
          setIsSignedIn(true);
          alignLocaleFromUser(user.locale ?? undefined);
        }
      } catch {
        await clearStoredAccessToken();
        if (!cancelled) {
          setIsSignedIn(false);
          setSessionProfile(null);
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [alignLocaleFromUser]);

  const establishSession = useCallback(async (accessToken: string, user?: AuthUserSummary) => {
    await persistAccessToken(accessToken);
    const profile = user ?? (await fetchSessionUser(accessToken));
    setSessionProfile(profile);
    setIsSignedIn(true);
    alignLocaleFromUser(profile.locale ?? undefined);
  }, [alignLocaleFromUser]);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const { accessToken, user } = await authLogin({ email, password });
      await establishSession(accessToken, user);
      void writeStoredUiLocale(pickUiLocaleForUser(user.locale ?? undefined, locale));
      return homeHrefForRole(user.role);
    },
    [establishSession, locale],
  );

  const registerAccount = useCallback(
    async (params: {
      email: string;
      password: string;
      name: string;
      lastName: string;
      phone: string;
      locale?: AppUiLocale;
    }) => {
      const { accessToken, user } = await authRegister({
        ...params,
        locale: params.locale ?? locale,
      });
      await establishSession(accessToken, user);
      void writeStoredUiLocale(pickUiLocaleForUser(user.locale ?? undefined, locale));
      return homeHrefForRole(user.role);
    },
    [establishSession, locale],
  );

  const refreshProfile = useCallback(async () => {
    const token = await readStoredAccessToken();
    if (token === null) {
      return;
    }
    try {
      const user = await fetchSessionUser(token);
      setSessionProfile(user);
    } catch {
      await clearStoredAccessToken();
      setSessionProfile(null);
      setIsSignedIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    const token = await readStoredAccessToken();
    if (token !== null) {
      try {
        await authLogout(token);
      } catch {
        // Still clear local session if the API is unreachable.
      }
    }
    await clearStoredAccessToken();
    setSessionProfile(null);
    setIsSignedIn(false);
  }, []);

  const homeHref = useMemo(() => {
    if (!isSignedIn || sessionProfile === null) {
      return "/user/home";
    }
    return homeHrefForRole(sessionProfile.role);
  }, [isSignedIn, sessionProfile]);

  const userGreetingName = useMemo(
    () => (sessionProfile === null ? "" : sessionGreetingDisplayName(sessionProfile)),
    [sessionProfile],
  );

  const homeImageUri = useMemo(() => {
    if (sessionProfile === null) {
      return null;
    }
    return resolveApiAssetUrl(getApiBaseUrl(), sessionProfile.homeImageUrl);
  }, [sessionProfile]);

  const userEmail = useMemo(
    () => (sessionProfile === null ? "" : sessionProfile.email),
    [sessionProfile],
  );

  const profileInitials = useMemo(
    () =>
      sessionProfile === null
        ? ""
        : buildProfileInitials({
            name: sessionProfile.name,
            lastName: sessionProfile.lastName,
            email: sessionProfile.email,
          }),
    [sessionProfile],
  );

  const role = useMemo(
    () => (sessionProfile === null ? null : sessionProfile.role),
    [sessionProfile],
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      isReady,
      isSignedIn,
      role,
      homeHref,
      userGreetingName,
      userEmail,
      homeImageUri,
      profileInitials,
      refreshProfile,
      establishSession,
      signInWithPassword,
      registerAccount,
      signOut,
    }),
    [
      establishSession,
      homeHref,
      homeImageUri,
      isReady,
      isSignedIn,
      profileInitials,
      refreshProfile,
      registerAccount,
      role,
      signInWithPassword,
      signOut,
      userEmail,
      userGreetingName,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (ctx === null) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
