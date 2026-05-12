export default function ManagerSettingsPage() {
  return (
    <div className="rounded-[24px] border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-zinc-900">Manager settings</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-600">
        Operational defaults are managed centrally. Reach out to studio admins for billing,
        integrations, or policy changes.
      </p>
    </div>
  );
}
