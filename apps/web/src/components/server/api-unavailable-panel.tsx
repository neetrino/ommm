import { Link } from "@/i18n/navigation";

/**
 * Shown when Nest is unreachable from the Next server (layout auth check).
 * Layout errors are not caught by segment `error.tsx`, so we render this inline.
 */
export function ApiUnavailablePanel() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold text-sage-900">API server is not running</h1>
      <p className="text-sm text-sage-600">
        Start the Nest API on port 4000, then reload. From the monorepo root run{" "}
        <code className="rounded bg-sage-100 px-1 py-0.5 text-xs">pnpm run dev</code>, or from{" "}
        <code className="rounded bg-sage-100 px-1 py-0.5 text-xs">apps/web</code> run{" "}
        <code className="rounded bg-sage-100 px-1 py-0.5 text-xs">pnpm run dev</code> (starts API +
        web).
      </p>
      <Link href="/" className="ommm-cta-primary inline-flex items-center justify-center">
        Reload home
      </Link>
    </div>
  );
}
