type AdminListMobileLabelProps = {
  label: string;
};

/**
 * Mobile list cards show values only. Desktop column headers stay in the table.
 * Kept as a no-op so leftover call sites do not reintroduce shouty field labels.
 */
export function AdminListMobileLabel({ label }: AdminListMobileLabelProps) {
  void label;
  return null;
}
