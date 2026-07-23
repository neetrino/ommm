"use client";

import { OmmButton } from "@/components/ui/omm-button";

type AdminSectionErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminSectionError({ error, reset }: AdminSectionErrorProps) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold text-sage-900">Something went wrong</h1>
      <p className="text-sm text-sage-600">
        Try again. If the problem continues, check the terminal logs.
        {error.digest ? (
          <span className="mt-2 block font-mono text-xs text-sage-500">{error.digest}</span>
        ) : null}
      </p>
      <OmmButton type="button" variant="primary" size="md" onClick={reset}>
        Try again
      </OmmButton>
    </div>
  );
}
