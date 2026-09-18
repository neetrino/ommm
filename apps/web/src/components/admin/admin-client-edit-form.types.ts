export type ClientEditFormState = {
  email: string;
  name: string;
  lastName: string;
  phone: string;
  whatsappPhone: string;
  dateOfBirth: string;
};

export type ClientEditInitialValues = ClientEditFormState;

export type ClientEditFormErrors = {
  email?: string;
  dateOfBirth?: string;
  phone?: string;
  whatsappPhone?: string;
};

import { formatPhoneDisplay } from "@/lib/phone";

export function clientFormFromInitial(initial: ClientEditInitialValues): ClientEditFormState {
  return {
    email: initial.email,
    name: initial.name,
    lastName: initial.lastName,
    phone: formatPhoneDisplay(initial.phone),
    whatsappPhone: formatPhoneDisplay(initial.whatsappPhone),
    dateOfBirth: initial.dateOfBirth,
  };
}

export function isClientFormDirty(
  form: ClientEditFormState,
  snapshot: ClientEditFormState,
): boolean {
  return (
    form.email !== snapshot.email ||
    form.name !== snapshot.name ||
    form.lastName !== snapshot.lastName ||
    form.phone !== snapshot.phone ||
    form.whatsappPhone !== snapshot.whatsappPhone ||
    form.dateOfBirth !== snapshot.dateOfBirth
  );
}
