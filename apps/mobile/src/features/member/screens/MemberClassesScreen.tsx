import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { readStoredAccessToken } from "../../../auth/accessTokenStorage";
import {
  bookSession,
  fetchClassSessionsRange,
  joinWaitlistSession,
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

function isSessionFull(s: ClassSessionRow): boolean {
  return s.status === "FULL" || s._count.bookings >= s.capacity;
}

export function MemberClassesScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ClassSessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const range = sessionRange();
      const rows = await fetchClassSessionsRange(range);
      setSessions(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load classes");
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

  async function onBookOrWaitlist(s: ClassSessionRow) {
    const token = await readStoredAccessToken();
    if (token === null) {
      router.push("/login");
      return;
    }
    const full = isSessionFull(s);
    try {
      if (full) {
        await joinWaitlistSession(token, s.id);
        Alert.alert("Waitlist", "You are on the waitlist for this class.");
      } else {
        await bookSession(token, s.id);
        Alert.alert("Booked", "Your spot is reserved.");
      }
      await load();
    } catch (e) {
      Alert.alert(
        "Could not complete",
        e instanceof Error ? e.message : "Try again later.",
      );
    }
  }

  return (
    <View style={styles.root}>
      <GradientBackdrop />
      {loading ? (
        <Text style={styles.meta}>Loading schedule…</Text>
      ) : error !== null ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPad}
          ListEmptyComponent={
            <Text style={styles.meta}>No classes in the next two weeks.</Text>
          }
          renderItem={({ item }) => {
            const full = isSessionFull(item);
            const coach = item.coach.user.name?.trim() || "Coach";
            const timeLabel = formatSessionStartLabel(
              item.startsAt,
              "en-US",
            );
            const dur = formatDurationMinutes(item.startsAt, item.endsAt);
            return (
              <View style={styles.card}>
                <Text style={styles.title}>{item.classType.name}</Text>
                <Text style={styles.line}>{timeLabel}</Text>
                <Text style={styles.lineMuted}>
                  {dur} · {coach} · {item._count.bookings}/{item.capacity} booked
                </Text>
                <Pressable
                  onPress={() => void onBookOrWaitlist(item)}
                  style={({ pressed }) => [
                    styles.cta,
                    pressed && styles.ctaPressed,
                  ]}
                >
                  <Text style={styles.ctaText}>
                    {full ? "Join waitlist" : "Book"}
                  </Text>
                </Pressable>
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
  listPad: {
    paddingHorizontal: space.screenHorizontal,
    paddingTop: space.lg,
    paddingBottom: space.xxl,
    gap: space.md,
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
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.white,
    padding: space.lg,
    gap: space.xs,
  },
  title: {
    fontFamily: fontFamilies.newsreader.semiBoldItalic,
    fontSize: typography.body,
    color: colors.ink,
  },
  line: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.ink,
  },
  lineMuted: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.caption,
    color: colors.bodyMuted,
  },
  cta: {
    marginTop: space.sm,
    alignSelf: "flex-start",
    backgroundColor: colors.primaryGreen80,
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
    borderRadius: 999,
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaText: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
