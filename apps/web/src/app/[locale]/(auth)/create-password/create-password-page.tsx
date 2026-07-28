"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { postAuthPathForRole } from "@/lib/role-home";
import { prefetchMarketingHeaderAccount } from "@/lib/prefetch-marketing-header-account";
import { markClientSessionHint } from "@/lib/client-session-hint";
import { pickUiLocaleForUser, setUiLocaleCookie } from "@/lib/ui-locale-cookie";
import { FormErrorBanner } from "@/components/ui/form-validation";
import { OmmButton } from "@/components/ui/omm-button";
import { PasswordInput } from "@/components/ui/password-input";

const PASSWORD_MIN_LENGTH = 8;

function readTokenFromPathParam(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string" || value.trim().length === 0) {
    return "";
  }
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

function resolveInviteToken(params: {
  initialToken: string;
  pathToken: string;
  queryToken: string;
}): string {
  if (params.initialToken.length > 0) {
    return params.initialToken;
  }
  if (params.pathToken.length > 0) {
    return params.pathToken;
  }
  if (params.queryToken.length > 0) {
    return params.queryToken;
  }
  if (typeof window === "undefined") {
    return "";
  }
  const fromQuery = new URLSearchParams(window.location.search).get("token")?.trim() ?? "";
  if (fromQuery.length > 0) {
    return fromQuery;
  }
  const segments = window.location.pathname.split("/").filter(Boolean);
  const createIdx = segments.indexOf("create-password");
  if (createIdx >= 0 && typeof segments[createIdx + 1] === "string") {
    return readTokenFromPathParam(segments[createIdx + 1]);
  }
  return "";
}

function CreatePasswordForm({ initialToken }: { initialToken: string }) {
  const router = useRouter();
  const urlLocale = useLocale();
  const t = useTranslations("auth.createPassword");
  const routeParams = useParams();
  const search = useSearchParams();
  const token = useMemo(
    () =>
      resolveInviteToken({
        initialToken: initialToken.trim(),
        pathToken: readTokenFromPathParam(
          routeParams.token as string | string[] | undefined,
        ),
        queryToken: search.get("token")?.trim() ?? "",
      }),
    [initialToken, routeParams.token, search],
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) {
      return;
    }
    setError(null);

    if (token.length === 0) {
      setError(t("missingToken"));
      return;
    }

    const nextPassword = password.trim();
    const confirmation = confirmPassword.trim();
    if (nextPassword.length < PASSWORD_MIN_LENGTH) {
      setError(t("passwordTooShort", { min: PASSWORD_MIN_LENGTH }));
      return;
    }
    if (nextPassword !== confirmation) {
      setError(t("mismatch"));
      return;
    }

    setBusy(true);
    try {
      const { user } = await apiFetch<{
        ok: boolean;
        user: { role: string; locale: string };
        accessToken: string;
      }>("/auth/create-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: nextPassword }),
      });
      markClientSessionHint();
      const nextLocale = pickUiLocaleForUser(user.locale, urlLocale);
      setUiLocaleCookie(nextLocale);
      await prefetchMarketingHeaderAccount();
      router.push(postAuthPathForRole(user.role), { locale: nextLocale });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("failed"));
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-sage-800">
        {t("title")}
      </h1>
      <p className="ommm-body-muted mt-2">{t("lead")}</p>

      {token.length === 0 ? (
        <FormErrorBanner message={t("missingToken")} variant="inline" className="mt-6" />
      ) : null}

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="ommm-label">{t("password")}</span>
          <PasswordInput
            required
            name="password"
            autoComplete="new-password"
            className="ommm-input"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            showPasswordLabel={t("showPassword")}
            hidePasswordLabel={t("hidePassword")}
            disabled={busy || token.length === 0}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="ommm-label">{t("confirmPassword")}</span>
          <PasswordInput
            required
            name="confirmPassword"
            autoComplete="new-password"
            className="ommm-input"
            value={confirmPassword}
            onChange={(ev) => setConfirmPassword(ev.target.value)}
            showPasswordLabel={t("showPassword")}
            hidePasswordLabel={t("hidePassword")}
            disabled={busy || token.length === 0}
          />
        </label>
        <OmmButton type="submit" variant="primary" disabled={busy || token.length === 0}>
          {busy ? t("submitting") : t("submit")}
        </OmmButton>
      </form>

      {error ? (
        <FormErrorBanner message={error} variant="inline" className="mt-4" />
      ) : null}

      <p className="ommm-body-muted mt-8 text-center text-sm">
        <Link href="/login" className="ommm-link-sage">
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}

export type CreatePasswordPageProps = {
  initialToken?: string;
};

export function CreatePasswordPage({ initialToken = "" }: CreatePasswordPageProps) {
  const t = useTranslations("common");
  return (
    <Suspense fallback={<p className="text-sm text-sage-500">{t("loading")}</p>}>
      <CreatePasswordForm initialToken={initialToken} />
    </Suspense>
  );
}
