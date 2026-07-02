export const ACCOUNT_PROFILE_FIELD_CELL_CLASS = "ommm-inset-row flex flex-col gap-0.5";
export const ACCOUNT_PROFILE_FIELD_LABEL_CLASS = "text-xs text-sage-500";
export const ACCOUNT_PROFILE_FIELD_VALUE_CLASS = "text-sm font-medium text-sage-800";
export const ACCOUNT_PROFILE_FIELD_VALUE_EMPTY_CLASS = "text-sm italic text-sage-500";
export const ACCOUNT_PROFILE_FIELD_INPUT_CLASS =
  "w-full border-0 bg-transparent p-0 text-sm font-medium text-sage-800 shadow-none outline-none focus:ring-0 placeholder:font-normal placeholder:text-sage-400 disabled:cursor-not-allowed disabled:opacity-60";

export type ProfileFormUser = {
  email: string;
  name: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth?: string | null;
  locale: string;
  role?: string;
};

export type AccountProfileInfoFormProps = {
  initialUser: ProfileFormUser;
  showRole?: boolean;
  /** When set, shows the shared coach-profile bio field (same source as admin coaches). */
  coachProfileId?: string | null;
  initialBio?: string | null;
};

export type AccountProfileFormState = {
  email: string;
  name: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  bio: string;
};
