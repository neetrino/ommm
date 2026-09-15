import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

type Option = { value: string; label: string };

function parseMultiCsv(value: string): string[] {
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "all") {
    return [];
  }
  return trimmed
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && part !== "all");
}

function serializeMultiCsv(values: readonly string[]): string {
  return values.filter((value) => value !== "all").join(",");
}

type CoachFilterChipRowProps = {
  label: string;
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
  /** Sort/order stays single-select; list filters are multi. */
  selectionMode?: "single" | "multi";
};

/** Chips for coach list filters. Multi by default; pass selectionMode="single" for sort. */
export function CoachFilterChipRow({
  label,
  options,
  value,
  onChange,
  selectionMode = "multi",
}: CoachFilterChipRowProps) {
  if (selectionMode === "single") {
    return (
      <View style={styles.block}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.chips}>
          {options.map((option) => {
            const active = value === option.value;
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

  const selected = parseMultiCsv(value);
  const isAll = selected.length === 0;

  function toggle(optionValue: string): void {
    if (optionValue === "all") {
      onChange("all");
      return;
    }
    const next = selected.includes(optionValue)
      ? selected.filter((entry) => entry !== optionValue)
      : [...selected, optionValue];
    onChange(next.length === 0 ? "all" : serializeMultiCsv(next));
  }

  return (
    <View style={styles.block}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>
        <Pressable
          onPress={() => onChange("all")}
          style={[styles.chip, isAll && styles.chipActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: isAll }}
        >
          <Text style={[styles.chipLabel, isAll && styles.chipLabelActive]}>All</Text>
        </Pressable>
        {options.map((option) => {
          if (option.value === "all") {
            return null;
          }
          const active = selected.includes(option.value);
          return (
            <Pressable
              key={option.value}
              onPress={() => toggle(option.value)}
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
  if (yearDigits.length < 4) {
    return yearDigits;
  }
  const clamped = Math.min(DATE_YEAR_MAX, Number(yearDigits.slice(0, 4)));
  return String(clamped);
}

export function formatCoachFilterDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, DATE_INPUT_MAX_DIGITS);
  const day = clampDayDigits(digits.slice(0, 2));
  const month = clampMonthDigits(digits.slice(2, 4));
  const year = clampYearDigits(digits.slice(4, 8));
  if (digits.length <= 2) {
    return day;
  }
  if (digits.length <= 4) {
    return `${day}/${month}`;
  }
  return `${day}/${month}/${year}`;
}

export function CoachDateField({
  label,
  value,
  placeholder,
  onChangeText,
}: CoachDateFieldProps) {
  return (
    <View style={styles.block}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={(next) => onChangeText(formatCoachFilterDateInput(next))}
        placeholder={placeholder}
        placeholderTextColor={colors.taupe}
        keyboardType="number-pad"
        style={styles.search}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: space.xs,
  },
  label: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: typography.label,
    color: colors.ink,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.xs,
  },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  chipActive: {
    borderColor: colors.sand,
    backgroundColor: colors.sandMuted,
  },
  chipLabel: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: typography.caption,
    color: colors.taupe,
  },
  chipLabelActive: {
    color: colors.ink,
  },
  search: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
    fontFamily: fontFamilies.body,
    fontSize: typography.body,
    color: colors.ink,
  },
});
