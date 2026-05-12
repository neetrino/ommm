import { getTranslations } from "next-intl/server";
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

type WorkspaceVariant = "admin" | "coach" | "manager";

type WorkspaceNoteCardProps = {
  variant: WorkspaceVariant;
  heading: string;
  body: string;
};

function WorkspaceNoteCard({ variant, heading, body }: WorkspaceNoteCardProps) {
  const isIndigo = variant === "coach";
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
      <h2 className={headingClass}>{heading}</h2>
      <p className={bodyClass}>{body}</p>
    </div>
  );
}

type StaffProfileT = Awaited<ReturnType<typeof getTranslations>>;

function staffVariantTitle(t: StaffProfileT, variant: Variant): string {
  switch (variant) {
    case "admin":
      return t("variants.admin.title");
    case "contentAdmin":
      return t("variants.contentAdmin.title");
    case "coach":
      return t("variants.coach.title");
    case "manager":
      return t("variants.manager.title");
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

function staffVariantDescription(t: StaffProfileT, variant: Variant): string {
  switch (variant) {
    case "admin":
      return t("variants.admin.description");
    case "contentAdmin":
      return t("variants.contentAdmin.description");
    case "coach":
      return t("variants.coach.description");
    case "manager":
      return t("variants.manager.description");
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

function workspaceHeading(t: StaffProfileT, variant: WorkspaceVariant): string {
  switch (variant) {
    case "admin":
      return t("workspace.admin.heading");
    case "coach":
      return t("workspace.coach.heading");
    case "manager":
      return t("workspace.manager.heading");
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

function workspaceBody(t: StaffProfileT, variant: WorkspaceVariant): string {
  switch (variant) {
    case "admin":
      return t("workspace.admin.body");
    case "coach":
      return t("workspace.coach.body");
    case "manager":
      return t("workspace.manager.body");
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

export async function StaffAccountSummary({ variant }: { variant: Variant }) {
  const t = await getTranslations("staffProfile");
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MeRow>("/users/me", cookie);

  if (!res.ok) {
    return <div className="app-alert-warn max-w-xl">{t("loadError")}</div>;
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

  const title = staffVariantTitle(t, variant);
  const description = staffVariantDescription(t, variant);

  return (
    <div className="space-y-6">
      <div className={mainCardClass}>
        <h1 className={titleClass}>{title}</h1>
        <p className={descClass}>{description}</p>
        <dl className="mt-6 space-y-3 text-sm">
          <div>
            <dt className={dtClass}>{t("fields.email")}</dt>
            <dd className={ddStrongClass}>{u.email}</dd>
          </div>
          <div>
            <dt className={dtClass}>{t("fields.name")}</dt>
            <dd className={ddClass}>{u.name ?? "—"}</dd>
          </div>
          <div>
            <dt className={dtClass}>{t("fields.role")}</dt>
            <dd className={ddClass}>{u.role}</dd>
          </div>
        </dl>
      </div>
      {variant === "admin" || variant === "coach" || variant === "manager" ? (
        <WorkspaceNoteCard
          variant={variant}
          heading={workspaceHeading(t, variant)}
          body={workspaceBody(t, variant)}
        />
      ) : null}
    </div>
  );
}
