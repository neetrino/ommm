export type ClassTypeEditFormState = {
  name: string;
  description: string;
};

export type ClassTypeEditFormErrors = {
  name?: string;
  description?: string;
};

export function classTypeFormFromRow(row: {
  name: string;
  description?: string | null;
}): ClassTypeEditFormState {
  return {
    name: row.name,
    description: row.description ?? "",
  };
}

export function emptyClassTypeForm(): ClassTypeEditFormState {
  return { name: "", description: "" };
}

export function isClassTypeFormDirty(
  form: ClassTypeEditFormState,
  snapshot: ClassTypeEditFormState,
): boolean {
  return (
    form.name !== snapshot.name ||
    form.description !== snapshot.description
  );
}
