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
  const isAdmin = variant === "admin";
  const cardClass = isIndigo
    ? "rounded-[24px] border border-indigo-100 bg-white p-8 shadow-sm"
    : isAdmin
      ? "ommm-account-section"
      : "rounded-[24px] border border-zinc-200 bg-white p-8 shadow-sm";
  const headingClass = isIndigo
    ? "text-lg font-semibold text-indigo-950"
    : isAdmin
      ? "ommm-h3 text-sage-800"
      : "text-lg font-semibold text-zinc-900";
  const bodyClass = isIndigo
    ? "mt-3 max-w-xl text-sm leading-relaxed text-indigo-900/85"
    : isAdmin
      ? "ommm-body-muted mt-3 max-w-xl"
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
      <div className="app-alert-warn max-w-xl">
        Could not load profile.
      </div>
    );
  }

  const u = res.data.user;
  const wellnessAdmin = variant === "admin";
  const mainCardClass = wellnessAdmin
    ? "ommm-account-section"
    : "rounded-[24px] border border-zinc-200 bg-white p-8 shadow-sm";
  const titleClass = wellnessAdmin ? "ommm-h2" : "text-2xl font-semibold text-zinc-900";
  const descClass = wellnessAdmin ? "ommm-body-muted mt-3" : "mt-2 text-sm text-zinc-600";
  const dtClass = wellnessAdmin
    ? "text-xs uppercase tracking-wide text-sage-500"
    : "text-xs uppercase tracking-wide text-zinc-500";
  const ddStrongClass = wellnessAdmin ? "font-medium text-sage-900" : "font-medium text-zinc-900";
  const ddClass = wellnessAdmin ? "text-sage-800" : "text-zinc-800";

  return (
    <div className="space-y-6">
      <div className={mainCardClass}>
        <h1 className={titleClass}>{copy.title}</h1>
        <p className={descClass}>{copy.description}</p>
        <dl className="mt-6 space-y-3 text-sm">
          <div>
            <dt className={dtClass}>Email</dt>
            <dd className={ddStrongClass}>{u.email}</dd>
          </div>
          <div>
            <dt className={dtClass}>Name</dt>
            <dd className={ddClass}>{u.name ?? "—"}</dd>
          </div>
          <div>
            <dt className={dtClass}>Role</dt>
            <dd className={ddClass}>{u.role}</dd>
          </div>
        </dl>
      </div>
      {variant === "admin" || variant === "coach" || variant === "manager" ? (
        <WorkspaceNoteCard variant={variant} />
      ) : null}
    </div>
  );
}
