import type { ReactNode } from "react";

type AccountPageFrameProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

/**
 * Account subpage header + width — aligns with member dashboard typography.
 */
export function AccountPageFrame({
  title,
  description,
  children,
}: AccountPageFrameProps) {
  return (
    <div className="ommm-container pb-8 pt-6 sm:pb-10 sm:pt-8">
      <header className="max-w-3xl">
        <h1 className="ommm-h2">{title}</h1>
        {description ? (
          <p className="ommm-body-muted mt-3">{description}</p>
        ) : null}
      </header>
      <div className="mt-6 sm:mt-8">{children}</div>
    </div>
  );
}

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
