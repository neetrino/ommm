import { Link } from "@/i18n/navigation";

export default function ContentAdminHomePage() {
  return (
    <div className="rounded-[24px] border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-zinc-900">Content workspace</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Manage studio posts and editorial content. Use the sidebar to open your
        tools.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/content-admin/content"
          className="inline-flex rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
        >
          Open content
        </Link>
        <Link
          href="/content-admin/profile"
          className="inline-flex rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
        >
          Profile
        </Link>
      </div>
    </div>
  );
}
