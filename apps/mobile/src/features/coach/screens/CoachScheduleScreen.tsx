import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PackagesPrimaryCta } from "../../packages/components/PackagesScreenActions";
import { useLocale, useTranslations } from "../../../i18n/I18nProvider";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";
import {
  CoachDateField,
  CoachFilterChipRow,
  CoachSearchField,
} from "../components/CoachFilterControls";
import {
  CoachStateCard,
} from "../components/CoachMetricCards";
import { CoachScreenShell } from "../components/CoachScreenShell";
import { useCoachPanelData } from "../hooks/useCoachPanelData";
import {
  DEFAULT_COACH_SCHEDULE_FILTERS,
  extractClassTypeNames,
  formatCoachSessionDate,
  formatCoachSessionTime,
  hasActiveCoachScheduleFilters,
  matchesCoachScheduleFilters,
  sortBySessionStartsAt,
} from "../lib/coachFilters";
import type {
  CoachScheduleFilterValues,
  CoachSessionStatus,
  SessionSortOrder,
} from "../types/coachPanel";

const STATUS_OPTIONS: CoachSessionStatus[] = [
  "ACTIVE",
  "FULL",
  "CANCELLED",
  "DRAFT",
];

export function CoachScheduleScreen() {
  const locale = useLocale();
  const t = useTranslations("coachPages.schedule");
  const tSort = useTranslations("listSort");
  const tStatus = useTranslations("adminPages.classes.status");
  const { state, reload } = useCoachPanelData({
    includeRoster: false,
    includeSalary: false,
  });
  const [filters, setFilters] = useState<CoachScheduleFilterValues>(
    DEFAULT_COACH_SCHEDULE_FILTERS,
  );

  const classTypes = useMemo(() => {
    if (state.status !== "ready") {
      return [];
    }
    return extractClassTypeNames(state.sessions.map((s) => s.classType.name));
  }, [state]);

  const filtered = useMemo(() => {
    if (state.status !== "ready") {
      return [];
    }
    const matched = state.sessions.filter((row) =>
      matchesCoachScheduleFilters(row, filters),
    );
    return sortBySessionStartsAt(matched, (row) => row.startsAt, filters.order);
  }, [filters, state]);

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
        label={t("filters.status")}
        value={filters.status}
        onChange={(status) =>
          setFilters((prev) => ({
            ...prev,
            status: status as CoachScheduleFilterValues["status"],
          }))
        }
        options={[
          { value: "all", label: t("filters.statusAll") },
          ...STATUS_OPTIONS.map((status) => ({
            value: status,
            label: tStatus(status),
          })),
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

      {hasActiveCoachScheduleFilters(filters) ? (
        <PackagesPrimaryCta
          label={t("filters.resetFilters")}
          onPress={() => setFilters(DEFAULT_COACH_SCHEDULE_FILTERS)}
          variant="ghost"
        />
      ) : null}

      <Text style={styles.count}>
        {t("sessionsCount", { count: filtered.length })}
      </Text>

      {filtered.length === 0 ? (
        <CoachStateCard
          message={
            hasActiveCoachScheduleFilters(filters)
              ? t("filteredEmptyTitle")
              : t("upcomingSessions.empty")
          }
        />
      ) : (
        <View style={styles.list}>
          {filtered.map((session) => (
            <View key={session.id} style={styles.card}>
              <Text style={styles.cardTitle}>{session.title}</Text>
              <Text style={styles.meta}>
                {formatCoachSessionDate(session.startsAt, locale)} ·{" "}
                {formatCoachSessionTime(session.startsAt, locale)}–
                {formatCoachSessionTime(session.endsAt, locale)}
              </Text>
              <Text style={styles.meta}>
                {session.classType.name} · {tStatus(session.status)} ·{" "}
                {session._count.bookings}/{session.capacity}
              </Text>
            </View>
          ))}
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
  list: {
    gap: space.sm,
  },
  card: {
    borderRadius: radii.labelCard,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: space.md,
    gap: space.xxs,
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
