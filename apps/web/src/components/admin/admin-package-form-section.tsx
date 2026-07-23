import type { ReactNode } from "react";

type AdminPackageFormSectionProps = {
  heading: string;
  description: string;
  children: ReactNode;
  variant?: "card" | "plain";
};

export function AdminPackageFormSection({
  heading,
  description,
  children,
  variant = "card",
}: AdminPackageFormSectionProps) {
  if (variant === "plain") {
    return <section className="flex flex-col gap-4">{children}</section>;
  }

  return (
    <section className="rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-sage-800">
          {heading}
        </h3>
        <p className="text-xs text-sage-500">{description}</p>
      </div>
      {children}
    </section>
  );
}
