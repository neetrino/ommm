import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSession } from "../../../auth/SessionProvider";
import { PackagesPrimaryCta } from "../../packages/components/PackagesScreenActions";
import { AccountProfileEditIconButton } from "../../profile/components/AccountProfileEditIconButton";
import { ProfileHomeImageSection } from "../../profile/components/ProfileHomeImageSection";
import { ProfileScreenShell } from "../../profile/components/ProfileScreenShell";
import { useTranslations } from "../../../i18n/I18nProvider";
import {
  fetchCoachAccountMe,
  patchCoachAccountFields,
  patchCoachBio,
} from "../../../lib/api/coachClient";
import {
  formatIsoDateToUi,
  parseBirthdayDisplayToIso,
} from "../../../lib/birthdayDisplay";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, space, typography } from "../../../theme/tokens";
import {
  CoachPersonalFormFields,
  type CoachPersonalFormState,
} from "../components/CoachPersonalFormFields";
import { CoachStateCard } from "../components/CoachMetricCards";
import { COACH_BIO_MAX_LENGTH } from "../lib/constants";

const EMPTY_FORM: CoachPersonalFormState = {
  email: "",
  name: "",
  lastName: "",
  phone: "",
  dateOfBirth: "",
  bio: "",
};

export function CoachPersonalScreen() {
  const tProfile = useTranslations("userPages.profile");
  const tForm = useTranslations("forms.profileEdit");
  const tHome = useTranslations("coachPages.home");
  const { refreshProfile } = useSession();

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [coachProfileId, setCoachProfileId] = useState<string | null>(null);
  const [form, setForm] = useState<CoachPersonalFormState>(EMPTY_FORM);
  const [snapshot, setSnapshot] = useState<CoachPersonalFormState>(EMPTY_FORM);
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
        const account = await fetchCoachAccountMe();
        const next: CoachPersonalFormState = {
          email: account.user.email,
          name: account.user.name ?? "",
          lastName: account.user.lastName ?? "",
          phone: account.user.phone ?? "",
          dateOfBirth: formatIsoDateToUi(account.user.dateOfBirth),
          bio: account.coachBio ?? "",
        };
        if (!cancelled) {
          setCoachProfileId(account.coachProfileId);
          setForm(next);
          setSnapshot(next);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : tForm("saveFailed"));
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey, tForm]);

  function updateField<K extends keyof CoachPersonalFormState>(
    key: K,
    value: CoachPersonalFormState[K],
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
    if (form.bio.length > COACH_BIO_MAX_LENGTH) {
      setError(tForm("bioTooLong"));
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await patchCoachAccountFields({
        email,
        name: form.name.trim() || null,
        lastName: form.lastName.trim() || null,
        phone: form.phone.trim() || null,
        dateOfBirth,
      });

      if (coachProfileId !== null && coachProfileId.length > 0) {
        try {
          await patchCoachBio(coachProfileId, form.bio.trim() || null);
        } catch {
          setMessage(tForm("bioSaveFailed"));
          await refreshProfile();
          setSnapshot(form);
          setEditing(false);
          return;
        }
      }

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
      <ProfileScreenShell title={tProfile("accountInfo")}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.taupe} />
        </View>
      </ProfileScreenShell>
    );
  }

  if (error !== null && form.email === "") {
    return (
      <ProfileScreenShell title={tProfile("accountInfo")}>
        <CoachStateCard
          message={error}
          actionLabel={tHome("retry")}
          onAction={reload}
        />
      </ProfileScreenShell>
    );
  }

  return (
    <ProfileScreenShell title={tProfile("accountInfo")}>
      <ProfileHomeImageSection />
      <CoachPersonalFormFields
        form={form}
        editing={editing}
        saving={saving}
        onChange={updateField}
        headerAction={
          editing ? undefined : (
            <AccountProfileEditIconButton
              onPress={() => {
                setEditing(true);
                setMessage(null);
                setError(null);
              }}
            />
          )
        }
        footer={
          editing ? (
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
          ) : undefined
        }
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}
    </ProfileScreenShell>
  );
}

const styles = StyleSheet.create({
  loading: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
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
