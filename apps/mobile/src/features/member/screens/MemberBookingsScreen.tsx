import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "../../../auth/SessionProvider";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { AppHeader } from "../../../components/layout/AppHeader";
import { appHeaderScrollPaddingTop } from "../../../components/layout/appHeaderLayout";
import { useAppHeaderBookPress } from "../../../components/layout/useAppHeaderBookPress";
import { BookingsEmptyState } from "../components/bookings/BookingsEmptyState";
import { BookingsErrorState } from "../components/bookings/BookingsErrorState";
import { BookingsLoadingSkeleton } from "../components/bookings/BookingsLoadingSkeleton";
import { BookingsTabNav } from "../components/bookings/BookingsTabNav";
import { MemberBookingCard } from "../components/bookings/MemberBookingCard";
import { useMemberBookingsCopy } from "../hooks/useMemberBookingsCopy";
import { useMemberBookingsScreenState } from "../hooks/useMemberBookingsScreenState";
import { BOOKINGS_PAGE_MOBILE } from "../lib/bookingsPageTokens";
import { bookingsForTab, type MemberBookingsTab } from "../lib/partitionMemberBookings";
import { colors, layout, space } from "../../../theme/tokens";
import { fontFamilies } from "../../../theme/fontFamilies";

export function MemberBookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const copy = useMemberBookingsCopy();
  const { isSignedIn } = useSession();
  const { bookings, loading, refreshing, error, refresh, reload } =
    useMemberBookingsScreenState({ isSignedIn });
  const [activeTab, setActiveTab] = useState<MemberBookingsTab>("upcoming");

  const visibleBookings = useMemo(
    () => bookingsForTab(bookings, activeTab),
    [activeTab, bookings],
  );

  const bottomPad =
    layout.tabBarHeight + Math.max(insets.bottom, space.sm) + space.xl;
  const onHeaderBookPress = useAppHeaderBookPress();
  const headerOffset = appHeaderScrollPaddingTop(insets.top);

  const onBrowseSchedule = () => {
    router.push("/user/schedule");
  };

  return (
    <View style={styles.root}>
      <GradientBackdrop />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerOffset, paddingBottom: bottomPad },
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.taupe}
            colors={[colors.taupe]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.lead}>{copy.lead}</Text>
        </View>

        <BookingsTabNav
          upcomingLabel={copy.tabs.upcoming}
          pastLabel={copy.tabs.past}
          ariaLabel={copy.tabs.aria}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {loading ? (
          <BookingsLoadingSkeleton />
        ) : error !== null ? (
          <BookingsErrorState
            message={error}
            retryLabel={copy.retryLabel}
            onRetry={reload}
          />
        ) : visibleBookings.length === 0 ? (
          <BookingsEmptyState
            title={
              activeTab === "upcoming"
                ? copy.emptyUpcomingTitle
                : copy.emptyPastTitle
            }
            description={
              activeTab === "upcoming"
                ? copy.emptyUpcomingDescription
                : copy.emptyPastDescription
            }
            actionLabel={
              activeTab === "upcoming" ? copy.browseScheduleCta : undefined
            }
            onActionPress={
              activeTab === "upcoming" ? onBrowseSchedule : undefined
            }
          />
        ) : (
          <View style={styles.list}>
            {visibleBookings.map((booking) => (
              <MemberBookingCard key={booking.id} booking={booking} copy={copy} />
            ))}
          </View>
        )}
      </ScrollView>
      <AppHeader onBookPress={onHeaderBookPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingHorizontal: BOOKINGS_PAGE_MOBILE.pageHorizontalPaddingPx,
    gap: BOOKINGS_PAGE_MOBILE.sectionGapPx,
    width: "100%",
    minWidth: 0,
  },
  header: {
    gap: BOOKINGS_PAGE_MOBILE.pageTitleToLeadGapPx,
  },
  title: {
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
    fontSize: BOOKINGS_PAGE_MOBILE.pageTitleSizePx,
    lineHeight: BOOKINGS_PAGE_MOBILE.pageTitleLineHeightPx,
    letterSpacing: -0.8,
    color: BOOKINGS_PAGE_MOBILE.pageTitleColor,
  },
  lead: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.16,
    color: colors.bodyMuted,
    maxWidth: 576,
  },
  list: {
    width: "100%",
    gap: BOOKINGS_PAGE_MOBILE.listGapPx,
  },
});
