import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PackagesPrimaryCta } from "../../packages/components/PackagesScreenActions";
import { useLocale, useTranslations } from "../../../i18n/I18nProvider";
import { patchBookingAttendance } from "../../../lib/api/coachClient";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";
import {
  CoachDateField,
  CoachFilterChipRow,
  CoachSearchField,
} from "../components/CoachFilterControls";
import { CoachStateCard } from "../components/CoachMetricCards";
import { CoachScreenShell } from "../components/CoachScreenShell";
import { useCoachPanelData } from "../hooks/useCoachPanelData";
import {
  DEFAULT_COACH_ROSTER_FILTERS,
  extractClassTypeNames,
  formatCoachSessionDate,
  formatCoachSessionTime,
  hasActiveCoachRosterFilters,
  matchesCoachRosterFilters,
  sortBySessionStartsAt,
} from "../lib/coachFilters";
import type {
  CoachRosterFilterValues,
  SessionSortOrder,
} from "../types/coachPanel";

export function CoachGroupsScreen() {
  const locale = useLocale();
  const t = useTranslations("coachPages.groups");
  const tSort = useTranslations("listSort");
  const tAttendance = useTranslations("forms.markAttendance");
  const { state, reload } = useCoachPanelData({
    includeRoster: true,
    includeSalary: false,
  });
  const [filters, setFilters] = useState<CoachRosterFilterValues>(
    DEFAULT_COACH_ROSTER_FILTERS,
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const classTypes = useMemo(() => {
    if (state.status !== "ready") {
      return [];
    }
    return extractClassTypeNames(
      state.roster.map((row) => row.session.classType.name),
    );
  }, [state]);

  const filtered = useMemo(() => {
    if (state.status !== "ready") {
      return [];
    }
    const matched = state.roster.filter((row) =>
      matchesCoachRosterFilters(row, filters),
    );
    return sortBySessionStartsAt(
      matched,
      (row) => row.session.startsAt,
      filters.order,
    );
  }, [filters, state]);

  async function markAttended(bookingId: string) {
    if (busyId !== null) {
      return;
    }
    setBusyId(bookingId);
    setActionError(null);
    setFeedback(null);
    try {
      await patchBookingAttendance(bookingId, true);
      setFeedback(t("attendanceSaved"));
      reload();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : tAttendance("failed"),
      );
    } finally {
      setBusyId(null);
    }
  }

  if (state.status === "loading") {
    return <CoachScreenShell title={t("title")} loading />;
  }

  if (state.status === "no_profile") {
    return (
      <CoachScreenShell title={t("title")}>
        <CoachStateCard message={t("noProfile")} />
      </CoachScreenShell>
    );
  }

  if (state.status === "error") {
    return (
      <CoachScreenShell title={t("title")}>
        <CoachStateCard
          message={state.message || t("loadFailed")}
          actionLabel={t("retry")}
          onAction={reload}
        />
      </CoachScreenShell>
    );
  }

  return (
    <CoachScreenShell title={t("title")}>
      <Text style={styles.description}>{t("description")}</Text>

      <CoachSearchField
        value={filters.search}
        placeholder={t("filters.searchPlaceholder")}
        onChangeText={(search) => setFilters((prev) => ({ ...prev, search }))}
      />

      <View style={styles.dateRow}>
        <CoachDateField
          label={t("filters.dateFrom")}
          value={filters.from}
          placeholder="YYYY-MM-DD"
          onChangeText={(from) => setFilters((prev) => ({ ...prev, from }))}
        />
        <CoachDateField
          label={t("filters.dateTo")}
          value={filters.to}
          placeholder="YYYY-MM-DD"
          onChangeText={(to) => setFilters((prev) => ({ ...prev, to }))}
        />
      </View>

      <CoachFilterChipRow
        label={t("filters.classAll")}
        value={filters.classType}
        onChange={(classType) => setFilters((prev) => ({ ...prev, classType }))}
        options={[
          { value: "all", label: t("filters.classAll") },
          ...classTypes.map((name) => ({ value: name, label: name })),
        ]}
      />

      <CoachFilterChipRow
        label={tSort("sort")}
        value={filters.order}
        onChange={(order) =>
          setFilters((prev) => ({
            ...prev,
            order: order as SessionSortOrder,
          }))
        }
        options={[
          { value: "upcoming", label: tSort("upcoming") },
          { value: "date-asc", label: tSort("dateAsc") },
          { value: "date-desc", label: tSort("dateDesc") },
        ]}
      />

      {hasActiveCoachRosterFilters(filters) ? (
        <PackagesPrimaryCta
          label={t("filters.resetFilters")}
          onPress={() => setFilters(DEFAULT_COACH_ROSTER_FILTERS)}
          variant="ghost"
        />
      ) : null}

      <Text style={styles.count}>
        {t("rosterCount", { count: filtered.length })}
      </Text>

      {feedback ? <Text style={styles.success}>{feedback}</Text> : null}
      {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

      {filtered.length === 0 ? (
        <CoachStateCard
          message={
            hasActiveCoachRosterFilters(filters)
              ? t("filteredEmptyTitle")
              : t("attendanceRoster.empty")
          }
        />
      ) : (
        <View style={styles.list}>
          {filtered.map((row) => {
            const displayName = row.user.name?.trim() || row.user.email;
            const busy = busyId === row.id;
            return (
              <View key={row.id} style={styles.card}>
                <Text style={styles.cardTitle}>{displayName}</Text>
                <Text style={styles.meta}>{row.user.email}</Text>
                <Text style={styles.meta}>
                  {row.session.classType.name} ·{" "}
                  {formatCoachSessionDate(row.session.startsAt, locale)} ·{" "}
                  {formatCoachSessionTime(row.session.startsAt, locale)}–
                  {formatCoachSessionTime(row.session.endsAt, locale)}
                </Text>
                <Text style={styles.meta}>{row.status}</Text>
                <PackagesPrimaryCta
                  label={busy ? t("markingAttendance") : tAttendance("attended")}
                  onPress={() => {
                    void markAttended(row.id);
                  }}
                  variant="ghost"
                />
              </View>
            );
          })}
        </View>
      )}
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
  dateRow: {
    flexDirection: "row",
    gap: space.sm,
  },
  count: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.secondarySage,
  },
  success: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.primaryGreen,
  },
  error: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.danger,
  },
  list: {
    gap: space.sm,
  },
  card: {
    borderRadius: radii.labelCard,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: space.md,
    gap: space.xs,
  },
  cardTitle: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    color: colors.primaryGreen,
  },
  meta: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.bodyMuted,
    lineHeight: 20,
  },
});
