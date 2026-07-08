import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { layout, space } from "../../../theme/tokens";
import { profileSectionLayout } from "../profileSectionLayout";

type ProfileScreenShellProps = {
  title?: string;
  children: ReactNode;
  /** Hub index — tighter top padding, centered column. */
  variant?: "hub" | "section";
};

export function ProfileScreenShell({
  title,
  children,
  variant = "section",
}: ProfileScreenShellProps) {
  const insets = useSafeAreaInsets();
  const bottomPad =
    layout.tabBarHeight + Math.max(insets.bottom, space.sm) + space.lg;

  return (
    <View style={profileSectionLayout.root}>
      <GradientBackdrop />
      <ScrollView
        contentContainerStyle={[
          profileSectionLayout.content,
          { paddingBottom: bottomPad },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {variant === "hub" ? (
          <View style={profileSectionLayout.hubShell}>{children}</View>
        ) : (
          <>
            {title ? <Text style={profileSectionLayout.pageTitle}>{title}</Text> : null}
            {children}
          </>
        )}
      </ScrollView>
    </View>
  );
}
