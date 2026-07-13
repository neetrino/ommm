import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { PackagesPrimaryCta } from "../../packages/components/PackagesScreenActions";
import { useTranslations } from "../../../i18n/I18nProvider";
import {
  fetchCoachAccountMe,
  patchNotificationPrefs,
} from "../../../lib/api/coachClient";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";
import { CoachStateCard } from "../components/CoachMetricCards";
import { CoachScreenShell } from "../components/CoachScreenShell";
import type { CoachNotificationPrefs } from "../types/coachPanel";

const DEFAULT_PREFS: CoachNotificationPrefs = {
  bookingReminders: true,
  waitlistAlerts: true,
  promotions: false,
  communityUpdates: true,
};

type PrefKey = keyof CoachNotificationPrefs;

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; prefs: CoachNotificationPrefs };

export function CoachNotificationsScreen() {
  const tPage = useTranslations("userPages.notifications");
  const tPrefs = useTranslations("forms.notificationPrefs");
  const tCoach = useTranslations("coachPages.home");
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [prefs, setPrefs] = useState<CoachNotificationPrefs>(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadState({ status: "loading" });
    void (async () => {
      try {
        const account = await fetchCoachAccountMe();
        if (!cancelled) {
          setPrefs(account.notificationPrefs);
          setLoadState({ status: "ready", prefs: account.notificationPrefs });
        }
      } catch (err) {
        if (!cancelled) {
          setLoadState({
            status: "error",
            message:
              err instanceof Error ? err.message : tPrefs("saveFailed"),
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey, tPrefs]);

  async function save() {
    if (saving) {
      return;
    }
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      await patchNotificationPrefs(prefs);
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : tPrefs("saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  function toggle(key: PrefKey, value: boolean) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  if (loadState.status === "loading") {
    return <CoachScreenShell title={tPage("title")} showBack loading />;
  }

  if (loadState.status === "error") {
    return (
      <CoachScreenShell title={tPage("title")} showBack>
        <CoachStateCard
          message={loadState.message}
          actionLabel={tCoach("retry")}
          onAction={reload}
        />
      </CoachScreenShell>
    );
  }

  const rows: { key: PrefKey; label: string }[] = [
    { key: "bookingReminders", label: tPrefs("bookingReminders") },
    { key: "waitlistAlerts", label: tPrefs("waitlistAlerts") },
    { key: "promotions", label: tPrefs("promotions") },
    { key: "communityUpdates", label: tPrefs("communityUpdates") },
  ];

  return (
    <CoachScreenShell title={tPage("title")} showBack>
      <Text style={styles.description}>{tPage("description")}</Text>

      <View style={styles.card}>
        {rows.map((row, index) => (
          <View
            key={row.key}
            style={[styles.row, index > 0 && styles.rowBorder]}
          >
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Switch
              value={prefs[row.key]}
              onValueChange={(value) => toggle(row.key, value)}
              disabled={saving}
              trackColor={{
                false: colors.taupe,
                true: colors.primaryGreen,
              }}
              thumbColor={colors.white}
            />
          </View>
        ))}
      </View>

      {saveError !== null ? <Text style={styles.error}>{saveError}</Text> : null}
      {saved ? <Text style={styles.success}>{tPrefs("saved")}</Text> : null}

      <PackagesPrimaryCta
        label={saving ? tPrefs("save") : tPrefs("save")}
        onPress={() => {
          void save();
        }}
      />
    </CoachScreenShell>
  );
}

const styles = StyleSheet.create({
  description: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.bodyMuted,
    lineHeight: 20,
  },
  card: {
    borderRadius: radii.labelCard,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  rowLabel: {
    flex: 1,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    color: colors.primaryGreen,
  },
  error: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.danger,
  },
  success: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.primaryGreen,
  },
});
