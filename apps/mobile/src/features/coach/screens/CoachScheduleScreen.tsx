import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PackagesPrimaryCta } from "../../packages/components/PackagesScreenActions";
import { useLocale, useTranslations } from "../../../i18n/I18nProvider";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, space, typography } from "../../../theme/tokens";
import {
  CoachDateField,
  CoachFilterChipRow,
  CoachSearchField,
} from "../components/CoachFilterControls";
import { CoachScheduleMonthView } from "../components/CoachScheduleMonthView";
import { CoachScheduleSessionCard } from "../components/CoachScheduleSessionCard";
import { CoachScheduleViewSwitcher } from "../components/CoachScheduleViewSwitcher";
import { CoachScheduleWeekView } from "../components/CoachScheduleWeekView";
import { CoachStateCard } from "../components/CoachMetricCards";
import { CoachScreenShell } from "../components/CoachScreenShell";
import { useCoachPanelData } from "../hooks/useCoachPanelData";
import {
  DEFAULT_COACH_SCHEDULE_FILTERS,
  extractClassTypeNames,
  hasActiveCoachScheduleFilters,
  matchesCoachScheduleFilters,
  sortBySessionStartsAt,
} from "../lib/coachFilters";
import type { CoachScheduleViewMode } from "../lib/coachScheduleView";
import type {
  CoachPanelSessionRow,
  CoachScheduleFilterValues,
  CoachSessionStatus,
  SessionSortOrder,
} from "../types/coachPanel";

const STATUS_OPTIONS: CoachSessionStatus[] = [
  "ACTIVE",
  "FULL",
  "FINISHED",
  "CANCELLED",
  "DRAFT",
];

function classTypeFilterOptions(
  classTypes: readonly string[],
  allLabel: string,
): { value: string; label: string }[] {
  return [
    { value: "all", label: allLabel },
    ...classTypes.map((name) => ({ value: name, label: name })),
  ];
}

function statusFilterOptions(
  allLabel: string,
  statusLabel: (status: CoachSessionStatus) => string,
): { value: string; label: string }[] {
  return [
    { value: "all", label: allLabel },
    ...STATUS_OPTIONS.map((status) => ({
      value: status,
      label: statusLabel(status),
    })),
  ];
}

export function CoachScheduleScreen() {
  const locale = useLocale();
  const t = useTranslations("coachPages.schedule");
  const tSort = useTranslations("listSort");
  const tStatus = useTranslations("adminPages.classes.status");
  const tViews = useTranslations("adminPages.classes.views");
  const tSchedule = useTranslations("adminPages.schedule");
  const { state, reload } = useCoachPanelData({
    includeRoster: false,
    includeSalary: false,
    includeSessionHistory: true,
  });
  const [filters, setFilters] = useState<CoachScheduleFilterValues>(
    DEFAULT_COACH_SCHEDULE_FILTERS,
  );
  const [view, setView] = useState<CoachScheduleViewMode>("list");

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
      <CoachScheduleFilters
        filters={filters}
        classTypes={classTypes}
        onChange={setFilters}
      />
      <CoachScheduleViewSwitcher
        value={view}
        ariaLabel={tViews("aria")}
        labels={{
          list: tViews("list"),
          weekly: tViews("weekly"),
          monthly: tViews("monthly"),
        }}
        onChange={setView}
      />
      <Text style={styles.count}>{t("sessionsCount", { count: filtered.length })}</Text>
      <CoachScheduleBody
        view={view}
        locale={locale}
        rows={filtered}
        emptyTitle={
          hasActiveCoachScheduleFilters(filters)
            ? t("filteredEmptyTitle")
            : t("upcomingSessions.empty")
        }
        emptyDay={tSchedule("weekView.emptyDay")}
        todayBadge={tSchedule("weekView.todayBadge")}
        prevMonthAria={tSchedule("monthView.previousMonth")}
        nextMonthAria={tSchedule("monthView.nextMonth")}
        statusLabel={(status) => tStatus(status)}
      />
    </CoachScreenShell>
  );
}

function CoachScheduleFilters({
  filters,
  classTypes,
  onChange,
}: {
  filters: CoachScheduleFilterValues;
  classTypes: readonly string[];
  onChange: (next: CoachScheduleFilterValues) => void;
}) {
  const t = useTranslations("coachPages.schedule");
  const tSort = useTranslations("listSort");
  const tStatus = useTranslations("adminPages.classes.status");

  return (
    <>
      <CoachSearchField
        value={filters.search}
        placeholder={t("filters.searchPlaceholder")}
        onChangeText={(search) => onChange({ ...filters, search })}
      />
      <View style={styles.dateRow}>
        <CoachDateField
          label={t("filters.dateFrom")}
          value={filters.from}
          placeholder="DD/MM/YYYY"
          onChangeText={(from) => onChange({ ...filters, from })}
        />
        <CoachDateField
          label={t("filters.dateTo")}
          value={filters.to}
          placeholder="DD/MM/YYYY"
          onChangeText={(to) => onChange({ ...filters, to })}
        />
      </View>
      <CoachFilterChipRow
        label={t("filters.classAll")}
        value={filters.classType}
        onChange={(classType) => onChange({ ...filters, classType })}
        options={classTypeFilterOptions(classTypes, t("filters.classAll"))}
      />
      <CoachFilterChipRow
        label={t("filters.status")}
        value={filters.status}
        onChange={(status) =>
          onChange({ ...filters, status: status as CoachScheduleFilterValues["status"] })
        }
        options={statusFilterOptions(t("filters.statusAll"), (status) => tStatus(status))}
      />
      <CoachFilterChipRow
        label={tSort("sort")}
        value={filters.order}
        onChange={(order) =>
          onChange({ ...filters, order: order as SessionSortOrder })
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
          onPress={() => onChange(DEFAULT_COACH_SCHEDULE_FILTERS)}
          variant="ghost"
        />
      ) : null}
    </>
  );
}

function CoachScheduleBody({
  view,
  locale,
  rows,
  emptyTitle,
  emptyDay,
  todayBadge,
  prevMonthAria,
  nextMonthAria,
  statusLabel,
}: {
  view: CoachScheduleViewMode;
  locale: string;
  rows: readonly CoachPanelSessionRow[];
  emptyTitle: string;
  emptyDay: string;
  todayBadge: string;
  prevMonthAria: string;
  nextMonthAria: string;
  statusLabel: (status: CoachSessionStatus) => string;
}) {
  if (view === "weekly") {
    return (
      <CoachScheduleWeekView
        locale={locale}
        rows={rows}
        emptyDay={emptyDay}
        todayBadge={todayBadge}
        statusLabel={statusLabel}
      />
    );
  }
  if (view === "monthly") {
    return (
      <CoachScheduleMonthView
        locale={locale}
        rows={rows}
        emptyDay={emptyDay}
        prevMonthAria={prevMonthAria}
        nextMonthAria={nextMonthAria}
        statusLabel={statusLabel}
      />
    );
  }
  if (rows.length === 0) {
    return <CoachStateCard message={emptyTitle} />;
  }
  return (
    <View style={styles.list}>
      {rows.map((session) => (
        <CoachScheduleSessionCard
          key={session.id}
          session={session}
          locale={locale}
          statusLabel={statusLabel(session.status)}
        />
      ))}
    </View>
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
});
