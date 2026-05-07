import { Link } from "@/i18n/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-md items-center justify-center px-4 sm:h-16">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-zinc-900"
          >
            Ommm
          </Link>
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <div className="app-surface-card w-full max-w-md p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
