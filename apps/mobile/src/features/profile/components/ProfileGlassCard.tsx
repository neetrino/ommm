import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import {
  PROFILE_GLASS_BLUR_INTENSITY,
  profileGlassCardFrame,
  profileGlassCardTint,
} from "../profileSectionLayout";

type ProfileGlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/** Frosted profile surface — matches web `ommm-account-section` glass. */
export function ProfileGlassCard({
  children,
  style,
  contentStyle,
}: ProfileGlassCardProps) {
  return (
    <View style={[profileGlassCardFrame, style]}>
      <BlurView
        intensity={PROFILE_GLASS_BLUR_INTENSITY}
        tint="light"
        style={StyleSheet.absoluteFill}
      />
      <View style={[profileGlassCardTint, StyleSheet.absoluteFill]} pointerEvents="none" />
      <View style={contentStyle}>{children}</View>
    </View>
  );
}
