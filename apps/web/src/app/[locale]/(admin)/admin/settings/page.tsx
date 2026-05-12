export default function AdminSettingsPage() {
  return (
    <div className="rounded-[24px] border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-600">
        Global studio configuration lives in environment variables and deployment tooling.
        Contact your engineering team to change API keys, mail transport, or integrations.
      </p>
    </div>
  );
}
