import { headers } from "next/headers";
import { serverApiJson } from "@/lib/server-api";

type MeRow = {
  user: {
    email: string;
    name: string | null;
    role: string;
  };
};

type Variant = "admin" | "contentAdmin" | "coach" | "manager";

const VARIANT_COPY: Record<
  Variant,
  { title: string; description: string }
> = {
  admin: {
    title: "Admin profile",
    description: "Your backoffice account summary.",
  },
  contentAdmin: {
    title: "Content editor profile",
    description: "Your content workspace account summary.",
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

type WorkspaceVariant = "admin" | "coach" | "manager";

const WORKSPACE_NOTE: Record<
  WorkspaceVariant,
  { heading: string; body: string; accent: "indigo" | "zinc" }
> = {
  admin: {
    heading: "Workspace & integrations",
    body: "Global studio configuration lives in environment variables and deployment tooling. Contact your engineering team to change API keys, mail transport, or integrations.",
    accent: "zinc",
  },
  coach: {
    heading: "Workspace & permissions",
    body: "Detailed roster and attendance tools are available on this dashboard; notify admins if you need permissions updates.",
    accent: "indigo",
  },
  manager: {
    heading: "Operational defaults",
    body: "Operational defaults are managed centrally. Reach out to studio admins for billing, integrations, or policy changes.",
    accent: "zinc",
  },
};

function WorkspaceNoteCard({ variant }: { variant: WorkspaceVariant }) {
  const note = WORKSPACE_NOTE[variant];
  const isIndigo = note.accent === "indigo";
  const cardClass = isIndigo
    ? "rounded-[24px] border border-indigo-100 bg-white p-8 shadow-sm"
    : "rounded-[24px] border border-zinc-200 bg-white p-8 shadow-sm";
  const headingClass = isIndigo
    ? "text-lg font-semibold text-indigo-950"
    : "text-lg font-semibold text-zinc-900";
  const bodyClass = isIndigo
    ? "mt-3 max-w-xl text-sm leading-relaxed text-indigo-900/85"
    : "mt-3 max-w-xl text-sm leading-relaxed text-zinc-600";

  return (
    <div className={cardClass}>
      <h2 className={headingClass}>{note.heading}</h2>
      <p className={bodyClass}>{note.body}</p>
    </div>
  );
}

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
    <div className="space-y-6">
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
      {variant === "admin" || variant === "coach" || variant === "manager" ? (
        <WorkspaceNoteCard variant={variant} />
      ) : null}
    </div>
  );
}
