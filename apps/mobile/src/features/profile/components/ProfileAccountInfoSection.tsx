import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSession } from "../../../auth/SessionProvider";
import { PackagesPrimaryCta } from "../../packages/components/PackagesScreenActions";
import { useTranslations } from "../../../i18n/I18nProvider";
import {
  fetchAccountProfile,
  patchAccountProfile,
} from "../../../lib/api/usersClient";
import {
  formatIsoDateToUi,
  parseBirthdayDisplayToIso,
} from "../../../lib/birthdayDisplay";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, space, typography } from "../../../theme/tokens";
import { AccountProfileEditIconButton } from "./AccountProfileEditIconButton";
import {
  AccountProfileFormFields,
  type AccountProfileFormState,
} from "./AccountProfileFormFields";
import { ProfileGlassCard } from "./ProfileGlassCard";

const EMPTY_FORM: AccountProfileFormState = {
  email: "",
  name: "",
  lastName: "",
  phone: "",
  dateOfBirth: "",
};

export function ProfileAccountInfoSection() {
  const tForm = useTranslations("forms.profileEdit");
  const { refreshProfile } = useSession();

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<AccountProfileFormState>(EMPTY_FORM);
  const [snapshot, setSnapshot] = useState<AccountProfileFormState>(EMPTY_FORM);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const account = await fetchAccountProfile();
        const next: AccountProfileFormState = {
          email: account.email,
          name: account.name ?? "",
          lastName: account.lastName ?? "",
          phone: account.phone ?? "",
          dateOfBirth: formatIsoDateToUi(account.dateOfBirth),
        };
        if (!cancelled) {
          setForm(next);
          setSnapshot(next);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : tForm("loadFailed"));
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey, tForm]);

  function updateField<K extends keyof AccountProfileFormState>(
    key: K,
    value: AccountProfileFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }

  function cancelEdit() {
    setForm(snapshot);
    setEditing(false);
    setMessage(null);
    setError(null);
  }

  function startEdit() {
    setEditing(true);
    setMessage(null);
    setError(null);
  }

  async function save() {
    if (saving) {
      return;
    }
    const email = form.email.trim();
    if (email.length === 0) {
      setError(tForm("emailRequired"));
      return;
    }
    const dobDisplay = form.dateOfBirth.trim();
    const dateOfBirth =
      dobDisplay === "" ? null : parseBirthdayDisplayToIso(dobDisplay);
    if (dobDisplay !== "" && dateOfBirth === null) {
      setError(tForm("dateOfBirthInvalid"));
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await patchAccountProfile({
        email,
        name: form.name.trim() || null,
        lastName: form.lastName.trim() || null,
        phone: form.phone.trim() || null,
        dateOfBirth,
      });
      await refreshProfile();
      setSnapshot(form);
      setEditing(false);
      setMessage(tForm("saveSuccess"));
    } catch (err) {
      setError(err instanceof Error ? err.message : tForm("saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.taupe} />
      </View>
    );
  }

  if (error !== null && form.email === "") {
    return (
      <ProfileGlassCard contentStyle={styles.errorCard}>
        <Text style={styles.error}>{error}</Text>
        <PackagesPrimaryCta
          label={tForm("retry")}
          onPress={reload}
          variant="ghost"
        />
      </ProfileGlassCard>
    );
  }

  return (
    <View style={styles.root}>
      <ProfileGlassCard contentStyle={styles.card}>
        {!editing ? (
          <AccountProfileEditIconButton onPress={startEdit} />
        ) : null}

        <AccountProfileFormFields
          form={form}
          editing={editing}
          saving={saving}
          onChange={updateField}
        />

        {editing ? (
          <View style={styles.actions}>
            <PackagesPrimaryCta
              label={saving ? tForm("saving") : tForm("save")}
              onPress={() => {
                void save();
              }}
            />
            <PackagesPrimaryCta
              label={tForm("cancel")}
              onPress={cancelEdit}
              variant="ghost"
            />
          </View>
        ) : null}
      </ProfileGlassCard>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: space.md,
  },
  loading: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    padding: space.lg,
    gap: space.md,
  },
  errorCard: {
    padding: space.lg,
    gap: space.md,
  },
  actions: {
    gap: space.sm,
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
