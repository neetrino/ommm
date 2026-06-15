"use client";

import {
  AdminSheetEditableField,
  adminSheetFieldInputClass,
} from "@/components/admin/admin-sheet-editable-field";
import { PhoneInputField } from "@/components/ui/phone-input-field";

export type StudioContactFieldErrors = Partial<
  Record<
    | "contactEmail"
    | "whatsappUrl"
    | "instagramUrl"
    | "facebookUrl",
    string
  >
>;

type AdminStudioContactSettingsFieldsProps = {
  busy: boolean;
  contactPhone: string;
  contactEmail: string;
  address: string;
  workingHours: string;
  instagramUrl: string;
  facebookUrl: string;
  whatsappUrl: string;
  fieldErrors: StudioContactFieldErrors;
  labels: {
    contactPhone: string;
    contactEmail: string;
    address: string;
    workingHours: string;
    instagramUrl: string;
    facebookUrl: string;
    whatsappUrl: string;
    hints: {
      contactPhone: string;
      contactEmail: string;
      address: string;
      workingHours: string;
      instagramUrl: string;
      facebookUrl: string;
      whatsappUrl: string;
    };
  };
  onContactPhoneChange: (value: string) => void;
  onContactEmailChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onWorkingHoursChange: (value: string) => void;
  onInstagramUrlChange: (value: string) => void;
  onFacebookUrlChange: (value: string) => void;
  onWhatsappUrlChange: (value: string) => void;
};

/** Contact information fields for the public contact page. */
export function AdminStudioContactSettingsFields({
  busy,
  contactPhone,
  contactEmail,
  address,
  workingHours,
  instagramUrl,
  facebookUrl,
  whatsappUrl,
  fieldErrors,
  labels,
  onContactPhoneChange,
  onContactEmailChange,
  onAddressChange,
  onWorkingHoursChange,
  onInstagramUrlChange,
  onFacebookUrlChange,
  onWhatsappUrlChange,
}: AdminStudioContactSettingsFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <AdminSheetEditableField label={labels.contactPhone} hint={labels.hints.contactPhone}>
        <PhoneInputField
          className={adminSheetFieldInputClass()}
          value={contactPhone}
          onValueChange={onContactPhoneChange}
          disabled={busy}
        />
      </AdminSheetEditableField>
      <AdminSheetEditableField
        label={labels.contactEmail}
        hint={labels.hints.contactEmail}
        error={fieldErrors.contactEmail}
      >
        <input
          type="email"
          className={adminSheetFieldInputClass(fieldErrors.contactEmail !== undefined)}
          value={contactEmail}
          onChange={(event) => onContactEmailChange(event.target.value)}
          disabled={busy}
        />
      </AdminSheetEditableField>
      <AdminSheetEditableField
        label={labels.address}
        hint={labels.hints.address}
        className="sm:col-span-2"
      >
        <textarea
          className={adminSheetFieldInputClass(false, "min-h-[4.5rem] resize-y py-2.5")}
          value={address}
          onChange={(event) => onAddressChange(event.target.value)}
          disabled={busy}
        />
      </AdminSheetEditableField>
      <AdminSheetEditableField
        label={labels.workingHours}
        hint={labels.hints.workingHours}
        className="sm:col-span-2"
      >
        <textarea
          className={adminSheetFieldInputClass(false, "min-h-[4.5rem] resize-y py-2.5")}
          value={workingHours}
          onChange={(event) => onWorkingHoursChange(event.target.value)}
          disabled={busy}
        />
      </AdminSheetEditableField>
      <AdminSheetEditableField
        label={labels.instagramUrl}
        hint={labels.hints.instagramUrl}
        error={fieldErrors.instagramUrl}
      >
        <input
          type="url"
          className={adminSheetFieldInputClass(fieldErrors.instagramUrl !== undefined)}
          value={instagramUrl}
          onChange={(event) => onInstagramUrlChange(event.target.value)}
          disabled={busy}
          placeholder="https://"
        />
      </AdminSheetEditableField>
      <AdminSheetEditableField
        label={labels.facebookUrl}
        hint={labels.hints.facebookUrl}
        error={fieldErrors.facebookUrl}
      >
        <input
          type="url"
          className={adminSheetFieldInputClass(fieldErrors.facebookUrl !== undefined)}
          value={facebookUrl}
          onChange={(event) => onFacebookUrlChange(event.target.value)}
          disabled={busy}
          placeholder="https://"
        />
      </AdminSheetEditableField>
      <AdminSheetEditableField
        label={labels.whatsappUrl}
        hint={labels.hints.whatsappUrl}
        error={fieldErrors.whatsappUrl}
        className="sm:col-span-2"
      >
        <input
          type="url"
          className={adminSheetFieldInputClass(fieldErrors.whatsappUrl !== undefined)}
          value={whatsappUrl}
          onChange={(event) => onWhatsappUrlChange(event.target.value)}
          disabled={busy}
          placeholder="https://"
        />
      </AdminSheetEditableField>
    </div>
  );
}
