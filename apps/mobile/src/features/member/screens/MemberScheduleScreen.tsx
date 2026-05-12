import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import {
  fetchClassSessionsRange,
  type ClassSessionRow,
} from "../../../lib/api/memberClient";
import { MEMBER_SESSION_RANGE_DAYS } from "../../../lib/member/sessionRangeDays";
import {
  formatDurationMinutes,
  formatSessionStartLabel,
} from "../../../lib/member/formatSessionLabels";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { colors, space, typography } from "../../../theme/tokens";
import { fontFamilies } from "../../../theme/fontFamilies";

function sessionRange(): { from: Date; to: Date } {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + MEMBER_SESSION_RANGE_DAYS);
  return { from, to };
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

type Section = { title: string; data: ClassSessionRow[] };

export function MemberScheduleScreen() {
  const [sessions, setSessions] = useState<ClassSessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchClassSessionsRange(sessionRange());
      setSessions(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load schedule");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const sections = useMemo<Section[]>(() => {
    const map = new Map<string, ClassSessionRow[]>();
    for (const s of sessions) {
      const k = dayKey(s.startsAt);
      const arr = map.get(k) ?? [];
      arr.push(s);
      map.set(k, arr);
    }
    return [...map.entries()].map(([title, data]) => ({
      title,
      data: data.sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      ),
    }));
  }, [sessions]);

  return (
    <View style={styles.root}>
      <GradientBackdrop />
      <Text style={styles.heading}>Schedule</Text>
      <Text style={styles.sub}>
        Next {MEMBER_SESSION_RANGE_DAYS} days · same sessions as Classes.
      </Text>
      {loading ? (
        <Text style={styles.meta}>Loading…</Text>
      ) : error !== null ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPad}
          ListEmptyComponent={
            <Text style={styles.meta}>No sessions in range.</Text>
          }
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionTitle}>{title}</Text>
          )}
          renderItem={({ item }) => {
            const coach = item.coach.user.name?.trim() || "Coach";
            const timeOnly = formatSessionStartLabel(item.startsAt, "en-US");
            const dur = formatDurationMinutes(item.startsAt, item.endsAt);
            return (
              <View style={styles.row}>
                <Text style={styles.rowTitle}>{item.classType.name}</Text>
                <Text style={styles.rowMeta}>
                  {timeOnly} · {dur} · {coach}
                </Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  heading: {
    marginTop: space.lg,
    marginHorizontal: space.screenHorizontal,
    fontFamily: fontFamilies.newsreader.semiBoldItalic,
    fontSize: typography.sectionTitle,
    color: colors.primaryGreen80,
  },
  sub: {
    marginTop: space.xs,
    marginHorizontal: space.screenHorizontal,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.caption,
    color: colors.bodyMuted,
  },
  listPad: {
    paddingBottom: space.xxl,
  },
  sectionTitle: {
    marginTop: space.lg,
    marginBottom: space.sm,
    marginHorizontal: space.screenHorizontal,
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.warmBrown,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    marginHorizontal: space.screenHorizontal,
    marginBottom: space.sm,
    padding: space.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.white,
  },
  rowTitle: {
    fontFamily: fontFamilies.newsreader.regular,
    fontSize: typography.body,
    color: colors.ink,
  },
  rowMeta: {
    marginTop: 4,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.caption,
    color: colors.bodyMuted,
  },
  meta: {
    marginTop: space.lg,
    marginHorizontal: space.screenHorizontal,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.bodyMuted,
  },
  error: {
    marginTop: space.lg,
    marginHorizontal: space.screenHorizontal,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.warmBrown,
  },
});
