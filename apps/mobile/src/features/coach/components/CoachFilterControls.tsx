import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

type Option = { value: string; label: string };

type CoachFilterChipRowProps = {
  label: string;
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
};

export function CoachFilterChipRow({
  label,
  options,
  value,
  onChange,
}: CoachFilterChipRowProps) {
  return (
    <View style={styles.block}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[styles.chip, active && styles.chipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type CoachSearchFieldProps = {
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
};

export function CoachSearchField({
  value,
  placeholder,
  onChangeText,
}: CoachSearchFieldProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.taupe}
      style={styles.search}
      autoCapitalize="none"
      autoCorrect={false}
      clearButtonMode="while-editing"
    />
  );
}

type CoachDateFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
};

/** Digits-only → `DD/MM/YYYY` (slashes inserted; letters never accepted). */
const DATE_INPUT_MAX_DIGITS = 8;

function formatDayMonthYearDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, DATE_INPUT_MAX_DIGITS);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function CoachDateField({
  label,
  value,
  placeholder,
  onChangeText,
}: CoachDateFieldProps) {
  return (
    <View style={styles.dateField}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={(next) => onChangeText(formatDayMonthYearDigits(next))}
        placeholder={placeholder}
        placeholderTextColor={colors.taupe}
        style={styles.search}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: space.xs,
  },
  label: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    color: colors.secondarySage,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.xs,
  },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.white,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  chipActive: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen,
  },
  chipLabel: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.caption,
    color: colors.secondarySage,
  },
  chipLabelActive: {
    color: colors.creamHighlight,
    fontFamily: fontFamilies.manrope.semiBold,
  },
  search: {
    borderRadius: radii.labelCard,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.white,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.ink,
  },
  dateField: {
    flex: 1,
    minWidth: 140,
    gap: space.xs,
  },
});
