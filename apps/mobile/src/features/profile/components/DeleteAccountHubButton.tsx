import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { OmmConfirmDialog } from "../../../components/ui/OmmConfirmDialog";
import { useSession } from "../../../auth/SessionProvider";
import { useTranslations } from "../../../i18n/I18nProvider";
import {
  deleteAccount,
  requestAccountDeletionCode,
} from "../../../lib/api/usersClient";
import { colors, radii, space, typography } from "../../../theme/tokens";
import { fontFamilies } from "../../../theme/fontFamilies";
import { platformShadow } from "../../../theme/platformShadow";
import { memberAccountHubActionTokens } from "../memberAccountHubActionTokens";

const LOGIN_HREF = "/login" as const;
const ACCOUNT_DELETION_CODE_LENGTH = 6;
const INVALID_DELETION_CODE = "Invalid or expired code";
const tokens = memberAccountHubActionTokens.deleteBtn;

type DeleteStep = "confirm" | "code";

export function DeleteAccountHubButton() {
  const router = useRouter();
  const { role, signOut } = useSession();
  const tProfile = useTranslations("userPages.profile");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [step, setStep] = useState<DeleteStep>("confirm");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetDialog = useCallback(() => {
    setStep("confirm");
    setCode("");
    setErrorMessage(null);
  }, []);

  const closeConfirm = useCallback(() => {
    if (busy) {
      return;
    }
    setConfirmOpen(false);
    resetDialog();
  }, [busy, resetDialog]);

  const sendCode = useCallback(async () => {
    setBusy(true);
    setErrorMessage(null);
    try {
      const result = await requestAccountDeletionCode();
      if (result.ok !== true) {
        throw new Error(tProfile("deleteAccountFailed"));
      }
      setStep("code");
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : tProfile("deleteAccountFailed"),
      );
    } finally {
      setBusy(false);
    }
  }, [tProfile]);

  const confirmDelete = useCallback(async () => {
    if (code.length !== ACCOUNT_DELETION_CODE_LENGTH) {
      setErrorMessage(tProfile("deleteAccountCodeInvalid"));
      return;
    }
    setBusy(true);
    setErrorMessage(null);
    try {
      const result = await deleteAccount(code);
      if (result.ok !== true) {
        throw new Error(tProfile("deleteAccountFailed"));
      }
      await signOut();
      setConfirmOpen(false);
      resetDialog();
      router.replace(LOGIN_HREF);
    } catch (e) {
      setErrorMessage(
        deletionFailureMessage(
          e,
          tProfile("deleteAccountFailed"),
          tProfile("deleteAccountCodeInvalid"),
        ),
      );
    } finally {
      setBusy(false);
    }
  }, [code, resetDialog, router, signOut, tProfile]);

  const onDeletePress = useCallback(() => {
    if (busy) {
      return;
    }
    resetDialog();
    setConfirmOpen(true);
  }, [busy, resetDialog]);

  const onConfirm = step === "code" ? confirmDelete : sendCode;
  const confirmLabel = deleteConfirmLabel(step, busy, {
    sending: tProfile("deleteAccountCodeSending"),
    deleting: tProfile("deleteAccountDeleting"),
    confirm: tProfile("deleteAccountConfirmYes"),
  });

  if (role === "COACH") {
    return null;
  }

  const label = busy ? tProfile("deleteAccountDeleting") : tProfile("deleteAccount");

  return (
    <>
      <Pressable
        onPress={onDeletePress}
        disabled={busy}
        style={({ pressed }) => [
          styles.deleteBtn,
          pressed && !busy && styles.deleteBtnPressed,
          busy && styles.deleteBtnDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: busy, busy }}
      >
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={tokens.iconSize}
            color={tokens.iconColor}
          />
        </View>

        <Text style={styles.deleteBtnLabel}>{label}</Text>

        <MaterialCommunityIcons
          name="chevron-right"
          size={tokens.chevronSize}
          color={tokens.chevronColor}
        />
      </Pressable>

      <OmmConfirmDialog
        visible={confirmOpen}
        title={
          step === "code"
            ? tProfile("deleteAccountCodeTitle")
            : tProfile("deleteAccountConfirmTitle")
        }
        description={
          step === "code"
            ? tProfile("deleteAccountCodeDescription")
            : tProfile("deleteAccountConfirmDescription")
        }
        confirmLabel={confirmLabel}
        cancelLabel={tProfile("deleteAccountConfirmNo")}
        backdropAriaLabel={tProfile("deleteAccountBackdropClose")}
        pending={busy}
        tone="danger"
        errorMessage={errorMessage}
        onConfirm={() => void onConfirm()}
        onCancel={closeConfirm}
      >
        {step === "code" ? (
          <TextInput
            value={code}
            editable={!busy}
            keyboardType="number-pad"
            maxLength={ACCOUNT_DELETION_CODE_LENGTH}
            placeholder={tProfile("deleteAccountCodePlaceholder")}
            placeholderTextColor={colors.taupe}
            style={styles.codeInput}
            onChangeText={(value) => {
              setCode(value.replace(/\D/g, "").slice(0, ACCOUNT_DELETION_CODE_LENGTH));
            }}
          />
        ) : null}
      </OmmConfirmDialog>
    </>
  );
}

function deleteConfirmLabel(
  step: DeleteStep,
  busy: boolean,
  labels: { sending: string; deleting: string; confirm: string },
): string {
  if (busy && step === "confirm") {
    return labels.sending;
  }
  if (busy) {
    return labels.deleting;
  }
  return labels.confirm;
}

function deletionFailureMessage(
  error: unknown,
  fallback: string,
  invalidCode: string,
): string {
  if (error instanceof Error && error.message === INVALID_DELETION_CODE) {
    return invalidCode;
  }
  return error instanceof Error ? error.message : fallback;
}

const styles = StyleSheet.create({
  deleteBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.gap,
    borderRadius: tokens.borderRadius,
    borderWidth: 1,
    borderColor: tokens.borderColor,
    backgroundColor: tokens.backgroundColor,
    paddingVertical: tokens.paddingVertical,
    paddingHorizontal: tokens.paddingHorizontal,
    ...platformShadow({
      color: tokens.shadowColor,
      offsetWidth: tokens.shadowOffset.width,
      offsetHeight: tokens.shadowOffset.height,
      opacity: tokens.shadowOpacity,
      radius: tokens.shadowRadius,
      elevation: 2,
    }),
  },
  deleteBtnPressed: {
    transform: [{ scale: tokens.pressedScale }],
  },
  deleteBtnDisabled: {
    opacity: tokens.disabledOpacity,
  },
  iconWrap: {
    width: tokens.iconWrapSize,
    height: tokens.iconWrapSize,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnLabel: {
    flex: 1,
    minWidth: 0,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: tokens.labelSize,
    lineHeight: tokens.labelLineHeight,
    color: tokens.labelColor,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radii.labelCard,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    color: colors.ink,
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    textAlign: "center",
  },
});
