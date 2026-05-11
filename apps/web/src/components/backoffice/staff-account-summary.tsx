import { headers } from "next/headers";
import { serverApiJson } from "@/lib/server-api";

type MeRow = {
  user: {
    email: string;
    name: string | null;
    role: string;
  };
};

type Variant = "admin" | "coach" | "manager";

const VARIANT_COPY: Record<
  Variant,
  { title: string; description: string }
> = {
  admin: {
    title: "Admin profile",
    description: "Your backoffice account summary.",
  },
  coach: {
    title: "Coach profile",
    description: "Your coach workspace identity.",
  },
  manager: {
    title: "Manager profile",
    description: "Studio operations account summary.",
  },
};

export async function StaffAccountSummary({ variant }: { variant: Variant }) {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MeRow>("/users/me", cookie);
  const copy = VARIANT_COPY[variant];

  if (!res.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Could not load profile.
      </div>
    );
  }

  const u = res.data.user;

  return (
    <div className="rounded-[24px] border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-zinc-900">{copy.title}</h1>
      <p className="mt-2 text-sm text-zinc-600">{copy.description}</p>
      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-500">Email</dt>
          <dd className="font-medium text-zinc-900">{u.email}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-500">Name</dt>
          <dd className="text-zinc-800">{u.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-500">Role</dt>
          <dd className="text-zinc-800">{u.role}</dd>
        </div>
      </dl>
    </div>
  );
}
