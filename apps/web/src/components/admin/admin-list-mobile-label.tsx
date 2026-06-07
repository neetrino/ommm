type AdminListMobileLabelProps = {
  label: string;
};

export function AdminListMobileLabel({ label }: AdminListMobileLabelProps) {
  return (
    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-sage-600 md:hidden">
      {label}
    </p>
  );
}
