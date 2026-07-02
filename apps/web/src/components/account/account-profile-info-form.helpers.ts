import {
  formatIsoDateToUi,
  formatPhoneDisplay,
} from "@/lib/date-display";
import { formatPhoneDisplay as formatPhoneDisplayFromLib } from "@/lib/phone";
import type {
  AccountProfileFormState,
  ProfileFormUser,
} from "@/components/account/account-profile-info-form.types";

export function accountProfileInitialFormState(
  user: ProfileFormUser,
  bio: string | null | undefined,
): AccountProfileFormState {
  return {
    email: user.email,
    name: user.name ?? "",
    lastName: user.lastName ?? "",
    phone: formatPhoneDisplayFromLib(user.phone ?? ""),
    dateOfBirth: formatIsoDateToUi(user.dateOfBirth),
    bio: bio ?? "",
  };
}

export { formatPhoneDisplay };
