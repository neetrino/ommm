import type { ReactNode } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import {
  AccountProfileFormFields,
  type AccountProfileFormState,
} from "../../profile/components/AccountProfileFormFields";
import { ProfileGlassCard } from "../../profile/components/ProfileGlassCard";
import { useTranslations } from "../../../i18n/I18nProvider";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

export type CoachPersonalFormState = AccountProfileFormState & {
  bio: string;
};

type CoachPersonalFormFieldsProps = {
  form: CoachPersonalFormState;
  editing: boolean;
  saving: boolean;
  onChange: <K extends keyof CoachPersonalFormState>(
    key: K,
    value: CoachPersonalFormState[K],
  ) => void;
  /** Shown at the top of the card (e.g. pen edit icon). */
  headerAction?: ReactNode;
  /** Shown below fields when editing (save / cancel). */
  footer?: ReactNode;
};

export function CoachPersonalFormFields({
  form,
  editing,
  saving,
  onChange,
  headerAction,
  footer,
}: CoachPersonalFormFieldsProps) {
  const tProfile = useTranslations("userPages.profile");

  return (
    <ProfileGlassCard contentStyle={styles.card}>
      {headerAction ?? null}

      <AccountProfileFormFields
        form={form}
        editing={editing}
        saving={saving}
        onChange={onChange}
      />

      <View style={styles.field}>
        <Text style={styles.label}>{tProfile("labels.bio")}</Text>
        {editing ? (
          <TextInput
            value={form.bio}
            onChangeText={(value) => onChange("bio", value)}
            style={[styles.input, styles.bioInput]}
            editable={!saving}
            multiline
            textAlignVertical="top"
          />
        ) : (
          <Text style={styles.value}>
            {form.bio.trim().length > 0 ? form.bio : tProfile("emptyValue")}
          </Text>
        )}
      </View>

      {footer ?? null}
    </ProfileGlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: space.lg,
    gap: space.md,
  },
  field: {
    gap: space.xxs,
  },
  label: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    color: colors.secondarySage,
  },
  value: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    color: colors.primaryGreen,
    lineHeight: 22,
  },
  input: {
    borderRadius: radii.labelCard,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.canvas,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    color: colors.ink,
  },
  bioInput: {
    minHeight: 120,
  },
});
