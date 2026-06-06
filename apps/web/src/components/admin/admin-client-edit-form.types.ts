export type ClientEditFormState = {
  email: string;
  name: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
};

export type ClientEditInitialValues = ClientEditFormState;

export type ClientEditFormErrors = {
  email?: string;
  dateOfBirth?: string;
};

export function clientFormFromInitial(initial: ClientEditInitialValues): ClientEditFormState {
  return {
    email: initial.email,
    name: initial.name,
    lastName: initial.lastName,
    phone: initial.phone,
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
    form.dateOfBirth !== snapshot.dateOfBirth
  );
}
