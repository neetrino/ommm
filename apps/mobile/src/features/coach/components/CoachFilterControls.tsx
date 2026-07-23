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

/** Digits-only → `DD/MM/YYYY` with per-part max clamps (day≤31, month≤12, year≤2100). */
const DATE_INPUT_MAX_DIGITS = 8;
const DATE_DAY_MAX = 31;
const DATE_MONTH_MAX = 12;
const DATE_YEAR_MAX = 2100;

function clampDayDigits(dayDigits: string): string {
  if (dayDigits.length === 0) {
    return "";
  }
  if (dayDigits.length === 1) {
    return Number(dayDigits) > 3 ? "3" : dayDigits;
  }
  const clamped = Math.min(DATE_DAY_MAX, Number(dayDigits.slice(0, 2)));
  return String(clamped).padStart(2, "0");
}

function clampMonthDigits(monthDigits: string): string {
  if (monthDigits.length === 0) {
    return "";
  }
  if (monthDigits.length === 1) {
    return Number(monthDigits) > 1 ? "1" : monthDigits;
  }
  const clamped = Math.min(DATE_MONTH_MAX, Number(monthDigits.slice(0, 2)));
  return String(clamped).padStart(2, "0");
}

function clampYearDigits(yearDigits: string): string {
  if (yearDigits.length === 0) {
    return "";
  }
  const n = Number(yearDigits);
  if (yearDigits.length === 1) {
    return n > 2 ? "2" : yearDigits;
  }
  if (yearDigits.length === 2) {
    return n > 21 ? "21" : yearDigits;
  }
  if (yearDigits.length === 3) {
    return n > 210 ? "210" : yearDigits;
  }
  const clamped = Math.min(DATE_YEAR_MAX, Number(yearDigits.slice(0, 4)));
  return String(clamped).padStart(4, "0");
}

function formatDayMonthYearDigits(raw: string): string {
  const only = raw.replace(/\D/g, "").slice(0, DATE_INPUT_MAX_DIGITS);

  let dayPart = "";
  let monthPart = "";
  let yearPart = "";

  if (only.length === 0) {
    return "";
  }
  if (only.length === 1) {
    dayPart = clampDayDigits(only);
    return dayPart;
  }

  dayPart = clampDayDigits(only.slice(0, 2));
  const rest = only.slice(2);

  if (rest.length === 0) {
    return dayPart;
  }
  if (rest.length === 1) {
    monthPart = clampMonthDigits(rest);
    return `${dayPart}/${monthPart}`;
  }

  monthPart = clampMonthDigits(rest.slice(0, 2));
  yearPart = clampYearDigits(rest.slice(2, 6));
  if (yearPart.length === 0) {
    return `${dayPart}/${monthPart}`;
  }
  return `${dayPart}/${monthPart}/${yearPart}`;
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
