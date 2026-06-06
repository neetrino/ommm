import type { ReactNode } from "react";

type AccountSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function AccountSection({ title, children, className = "" }: AccountSectionProps) {
  return (
    <section className={`ommm-account-section ${className}`.trim()}>
      <h2 className="ommm-h3 text-sage-800">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
