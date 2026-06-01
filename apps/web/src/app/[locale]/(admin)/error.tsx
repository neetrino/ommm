"use client";

import { OmmButton } from "@/components/ui/omm-button";

type AdminSectionErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminSectionError({ error, reset }: AdminSectionErrorProps) {
  const isApiUnavailable = error.name === "ServiceUnavailableError";

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold text-sage-900">
        {isApiUnavailable ? "API server is not running" : "Something went wrong"}
      </h1>
      <p className="text-sm text-sage-600">
        {isApiUnavailable
          ? "Start the Nest API on port 4000, then reload this page. From the monorepo root run: pnpm run dev"
          : "Try again. If the problem continues, check the terminal logs."}
      </p>
      <OmmButton type="button" variant="primary" size="md" onClick={reset}>
        Try again
      </OmmButton>
    </div>
  );
}
