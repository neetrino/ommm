import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AccountChangePasswordForm } from "@/components/account/account-change-password-form";
import { AccountHomeImageForm } from "@/components/account/account-home-image-form";
import { NotificationPrefsForm } from "@/components/account/notification-prefs-form";
import {
  AccountPageFrame,
  AccountSection,
} from "@/components/layout/account-page-frame";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import { serverApiJson } from "@/lib/server-api";

type MeResponse = {
  user: {
    email: string;
    name: string | null;
    lastName: string | null;
    phone: string | null;
    locale: string;
    homeImageUrl?: string | null;
  };
  notificationPrefs: {
    bookingReminders: boolean;
    waitlistAlerts: boolean;
    promotions: boolean;
    communityUpdates: boolean;
  };
};

export default async function UserProfilePage() {
  const t = await getTranslations("userPages.profile");
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MeResponse>("/users/me", cookie);

  if (!res.ok) {
    return (
      <div className="ommm-container pt-6 sm:pt-8">
        <div className="app-alert-warn">{t("signInPrompt")}</div>
      </div>
    );
  }

  const { user, notificationPrefs } = res.data;
  const homePreviewUrl = resolveApiAssetUrl(user.homeImageUrl ?? null);
  const empty = t("emptyValue");

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <div className="max-w-4xl space-y-10">
        <AccountSection title={t("accountInfo")}>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-sage-500">{t("labels.email")}</dt>
              <dd className="font-medium text-sage-800">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sage-500">{t("labels.name")}</dt>
              <dd className="text-sage-700">{user.name ?? empty}</dd>
            </div>
            <div>
              <dt className="text-sage-500">{t("labels.lastName")}</dt>
              <dd className="text-sage-700">{user.lastName ?? empty}</dd>
            </div>
            <div>
              <dt className="text-sage-500">{t("labels.phone")}</dt>
              <dd className="text-sage-700">{user.phone ?? empty}</dd>
            </div>
            <div>
              <dt className="text-sage-500">{t("labels.locale")}</dt>
              <dd className="text-sage-700">{user.locale}</dd>
            </div>
          </dl>
        </AccountSection>

        <AccountSection title={t("security")}>
          <AccountChangePasswordForm />
        </AccountSection>

        <AccountSection title={t("homeImage")}>
          <AccountHomeImageForm initialPreviewUrl={homePreviewUrl} />
        </AccountSection>

        <AccountSection title={t("preferences")}>
          <div className="max-w-md">
            <NotificationPrefsForm initial={notificationPrefs} />
          </div>
        </AccountSection>
      </div>
    </AccountPageFrame>
  );
}
