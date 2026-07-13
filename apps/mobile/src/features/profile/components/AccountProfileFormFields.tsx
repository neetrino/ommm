import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslations } from "../../../i18n/I18nProvider";
import { formatBirthdayInput } from "../../../lib/birthdayDisplay";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

export type AccountProfileFormState = {
  email: string;
  name: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
};

type AccountProfileFormFieldsProps = {
  form: AccountProfileFormState;
  editing: boolean;
  saving: boolean;
  onChange: <K extends keyof AccountProfileFormState>(
    key: K,
    value: AccountProfileFormState[K],
  ) => void;
};

export function AccountProfileFormFields({
  form,
  editing,
  saving,
  onChange,
}: AccountProfileFormFieldsProps) {
  const tProfile = useTranslations("userPages.profile");

  return (
    <View style={styles.fields}>
      {(
        [
          ["name", tProfile("labels.name")],
          ["lastName", tProfile("labels.lastName")],
          ["email", tProfile("labels.email")],
          ["phone", tProfile("labels.phone")],
          ["dateOfBirth", tProfile("labels.dateOfBirth")],
        ] as const
      ).map(([key, label]) => (
        <View key={key} style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          {editing ? (
            <TextInput
              value={form[key]}
              onChangeText={(value) =>
                onChange(
                  key,
                  key === "dateOfBirth" ? formatBirthdayInput(value) : value,
                )
              }
              style={styles.input}
              editable={!saving}
              autoCapitalize={key === "email" ? "none" : "words"}
              keyboardType={
                key === "email"
                  ? "email-address"
                  : key === "phone"
                    ? "phone-pad"
                    : "default"
              }
              placeholder={key === "dateOfBirth" ? "DD/MM/YYYY" : undefined}
              placeholderTextColor={colors.taupe}
            />
          ) : (
            <Text style={styles.value}>
              {form[key].trim().length > 0 ? form[key] : tProfile("emptyValue")}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fields: {
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
});
