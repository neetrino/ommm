import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSession } from "../../../auth/SessionProvider";
import type { UploadPickResult } from "../../../lib/api/usersClient";
import { deleteHomeImage, uploadHomeImage } from "../../../lib/api/usersClient";
import { colors } from "../../../theme/tokens";
import { profileHomeImageSectionStyles as styles } from "./profileHomeImageSection.styles";

const HOME_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function ProfileHomeImageSection() {
  const { refreshProfile, homeImageUri, profileInitials } = useSession();
  const [pendingPick, setPendingPick] = useState<UploadPickResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);

  const hasPendingPreview = pendingPick !== null;
  const hasSavedPhoto =
    !hasPendingPreview && homeImageUri !== null && homeImageUri !== "";
  const displayPreviewUri = hasPendingPreview ? pendingPick.uri : homeImageUri;

  const onChoosePress = useCallback(async () => {
    if (busy || hasPendingPreview) {
      return;
    }

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

    setPendingPick({
      uri: asset.uri,
      mimeType: asset.mimeType ?? "image/jpeg",
      fileName: asset.fileName ?? undefined,
    });
  }, [busy, hasPendingPreview]);

  const onRemovePendingPress = useCallback(() => {
    if (busy) {
      return;
    }
    setPendingPick(null);
    setFeedback(null);
  }, [busy]);

  const onDeleteSavedPress = useCallback(async () => {
    if (busy || !hasSavedPhoto) {
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      await deleteHomeImage();
      setFeedback({ kind: "ok", text: "Photo removed successfully." });
      await refreshProfile();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setFeedback({ kind: "err", text: message });
    } finally {
      setBusy(false);
    }
  }, [busy, hasSavedPhoto, refreshProfile]);

  const onConfirmPress = useCallback(async () => {
    if (busy || pendingPick === null) {
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      await uploadHomeImage(pendingPick);
      setFeedback({ kind: "ok", text: "Photo updated successfully." });
      setPendingPick(null);
      await refreshProfile();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setFeedback({ kind: "err", text: message });
    } finally {
      setBusy(false);
    }
  }, [busy, pendingPick, refreshProfile]);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Profile photo</Text>
      <Text style={styles.sectionLead}>
        Shown on your Home tab and account pages. JPG, PNG, or WEBP up to 5 MB.
      </Text>

      {displayPreviewUri !== null && displayPreviewUri !== "" ? (
        <View
          style={[
            styles.previewWrap,
            hasPendingPreview && styles.previewWrapPending,
          ]}
        >
          <Image
            source={{ uri: displayPreviewUri }}
            style={styles.previewImage}
            contentFit="cover"
            accessibilityRole="image"
            accessibilityLabel={
              hasPendingPreview
                ? "Temporary profile photo preview"
                : "Profile photo preview"
            }
          />
        </View>
      ) : (
        <View style={styles.initialsPreviewWrap}>
          <Text style={styles.initialsPreviewText}>{profileInitials}</Text>
        </View>
      )}

      {hasPendingPreview ? (
        <Text style={styles.pendingHint}>
          Preview — confirm to save this photo, or remove to choose another.
        </Text>
      ) : null}

      {feedback ? (
        <Text
          style={feedback.kind === "ok" ? styles.feedbackOk : styles.feedbackErr}
          accessibilityLiveRegion="polite"
        >
          {feedback.text}
        </Text>
      ) : null}

      {hasPendingPreview ? (
        <View style={styles.row}>
          <Pressable
            onPress={onRemovePendingPress}
            disabled={busy}
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && !busy && styles.secondaryPressed,
              busy && styles.btnDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Remove selected image"
            accessibilityState={{ disabled: busy }}
          >
            <Text style={styles.removeLabel}>Remove</Text>
          </Pressable>

          <Pressable
            onPress={() => void onConfirmPress()}
            disabled={busy}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && !busy && styles.primaryPressed,
              busy && styles.btnDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Confirm profile photo"
            accessibilityState={{ disabled: busy }}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryLabel}>Confirm</Text>
            )}
          </Pressable>
        </View>
      ) : hasSavedPhoto ? (
        <View style={styles.row}>
          <Pressable
            onPress={() => void onChoosePress()}
            disabled={busy}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && !busy && styles.primaryPressed,
              busy && styles.btnDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Choose profile photo"
            accessibilityState={{ disabled: busy }}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryLabel}>Choose image</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => void onDeleteSavedPress()}
            disabled={busy}
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && !busy && styles.secondaryPressed,
              busy && styles.btnDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Delete profile photo"
            accessibilityState={{ disabled: busy }}
          >
            <Text style={styles.removeLabel}>Delete photo</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={() => void onChoosePress()}
          disabled={busy}
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && !busy && styles.primaryPressed,
            busy && styles.btnDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Choose profile photo"
          accessibilityState={{ disabled: busy }}
        >
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.primaryLabel}>Choose image</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}
