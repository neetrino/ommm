import { Image } from "expo-image";
import { Text, View } from "react-native";
import { accountHubLayout } from "../accountHubLayout";

type AccountHubHeaderProps = {
  displayName: string;
  email: string;
  avatarImageUri?: string | null;
  initials?: string;
};

export function AccountHubHeader({
  displayName,
  email,
  avatarImageUri,
  initials,
}: AccountHubHeaderProps) {
  return (
    <View style={accountHubLayout.header}>
      <View style={accountHubLayout.avatarWrap}>
        <View style={accountHubLayout.avatarRing}>
          {avatarImageUri ? (
            <Image
              source={{ uri: avatarImageUri }}
              style={accountHubLayout.avatarImage}
              contentFit="cover"
              accessibilityLabel="Your profile photo"
            />
          ) : initials ? (
            <View style={accountHubLayout.avatarInitialsShell}>
              <Text style={accountHubLayout.avatarInitialsText}>{initials}</Text>
            </View>
          ) : (
            <View
              style={accountHubLayout.avatarPlaceholder}
              accessibilityLabel="Profile avatar"
            />
          )}
        </View>
      </View>
      <View style={accountHubLayout.textBlock}>
        <Text style={accountHubLayout.name} numberOfLines={2}>
          {displayName}
        </Text>
        <Text style={accountHubLayout.email} numberOfLines={1}>
          {email}
        </Text>
      </View>
    </View>
  );
}
