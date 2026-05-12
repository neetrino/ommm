import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSession } from "../../../auth/SessionProvider";
import type { UploadPickResult } from "../../../lib/api/usersClient";
import { uploadHomeImage } from "../../../lib/api/usersClient";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

const HOME_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function ProfileHomeImageSection() {
  const { refreshProfile, homeImageUri } = useSession();
  const [pick, setPick] = useState<UploadPickResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);

  const displayPreviewUri = pick?.uri ?? homeImageUri;

  const onPickPress = useCallback(async () => {
    setFeedback(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setFeedback({
        kind: "err",
        text: "Photo library access is required to choose an image.",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.88,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    if (
      typeof asset.fileSize === "number" &&
      asset.fileSize > HOME_IMAGE_MAX_BYTES
    ) {
      setFeedback({
        kind: "err",
        text: "Image is too large. Maximum size is 5 MB.",
      });
      return;
    }

    setPick({
      uri: asset.uri,
      mimeType: asset.mimeType ?? "image/jpeg",
      fileName: asset.fileName ?? undefined,
    });
  }, []);

  const onUploadPress = useCallback(async () => {
    setFeedback(null);
    if (pick === null) {
      setFeedback({
        kind: "err",
        text: "Choose an image first.",
      });
      return;
    }

    setBusy(true);
    try {
      await uploadHomeImage(pick);
      setFeedback({ kind: "ok", text: "Home image updated successfully." });
      setPick(null);
      await refreshProfile();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setFeedback({ kind: "err", text: message });
    } finally {
      setBusy(false);
    }
  }, [pick, refreshProfile]);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Home image</Text>
      <Text style={styles.sectionLead}>
        Custom photo shown at the top of your Home tab. JPG, PNG, or WEBP up to 5 MB.
      </Text>

      {displayPreviewUri !== null && displayPreviewUri !== "" ? (
        <View style={styles.previewWrap}>
          <Image
            source={{ uri: displayPreviewUri }}
            style={styles.previewImage}
            contentFit="cover"
            accessibilityRole="image"
            accessibilityLabel="Home image preview"
          />
        </View>
      ) : (
        <Text style={styles.placeholder}>No custom image yet — default Home layout applies.</Text>
      )}

      {feedback ? (
        <Text
          style={feedback.kind === "ok" ? styles.feedbackOk : styles.feedbackErr}
          accessibilityLiveRegion="polite"
        >
          {feedback.text}
        </Text>
      ) : null}

      <View style={styles.row}>
        <Pressable
          onPress={() => void onPickPress()}
          disabled={busy}
          style={({ pressed }) => [
            styles.secondaryBtn,
            pressed && !busy && styles.secondaryPressed,
            busy && styles.btnDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Choose image"
        >
          <Text style={styles.secondaryLabel}>Choose image</Text>
        </Pressable>

        <Pressable
          onPress={() => void onUploadPress()}
          disabled={busy || pick === null}
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && !busy && pick !== null && styles.primaryPressed,
            (busy || pick === null) && styles.btnDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Upload home image"
          accessibilityState={{ disabled: busy || pick === null }}
        >
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.primaryLabel}>Save to Home</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const PREVIEW_HEIGHT = 200;

const styles = StyleSheet.create({
  card: {
    gap: space.md,
    padding: space.lg,
    borderRadius: radii.labelCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    backgroundColor: colors.overlayWhite38,
  },
  sectionTitle: {
    fontFamily: fontFamilies.newsreader.semiBold,
    fontSize: typography.sectionTitle,
    color: colors.primaryGreen,
  },
  sectionLead: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    color: colors.secondarySage,
  },
  previewWrap: {
    borderRadius: radii.labelCard,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    backgroundColor: colors.primaryGreen,
  },
  previewImage: {
    width: "100%",
    height: PREVIEW_HEIGHT,
  },
  placeholder: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.bodyMuted,
    fontStyle: "italic",
  },
  feedbackOk: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.primaryGreen,
  },
  feedbackErr: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.danger,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    alignItems: "center",
  },
  secondaryBtn: {
    flexGrow: 1,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: space.md,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.overlayGreen20,
    backgroundColor: colors.overlayWhite20,
  },
  secondaryPressed: {
    opacity: 0.88,
  },
  primaryBtn: {
    flexGrow: 1,
    minWidth: 140,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: space.md,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryGreen,
  },
  primaryPressed: {
    opacity: 0.92,
  },
  btnDisabled: {
    opacity: 0.55,
  },
  secondaryLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.primaryGreen,
  },
  primaryLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.white,
  },
});
