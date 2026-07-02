import { Pressable, Text, View } from "react-native";
import { NextClassDetailsPanel } from "./next-class/NextClassDetailsPanel";
import { NextClassHeroCard } from "./next-class/NextClassHeroCard";
import { nextClassStyles as styles } from "./next-class/nextClassStyles";
import type {
  NextClassContent,
  NextClassSectionProps,
} from "./next-class/nextClassTypes";

export type { NextClassContent } from "./next-class/nextClassTypes";

export function NextClassSection({
  content,
  onAllEventsPress,
  onOpenClassPress,
}: NextClassSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Next Class</Text>
        <Pressable
          onPress={onAllEventsPress}
          accessibilityRole="button"
          accessibilityLabel="View all events"
        >
          <Text style={styles.allEvents}>ALL EVENTS</Text>
        </Pressable>
      </View>

      <NextClassHeroCard content={content} onOpenClassPress={onOpenClassPress} />
      <NextClassDetailsPanel content={content} />
    </View>
  );
}
