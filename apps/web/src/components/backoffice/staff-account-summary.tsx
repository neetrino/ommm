import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { adminChrome } from "@/components/admin/admin-chrome";
import { serverApiJson } from "@/lib/server-api";
import { workspaceAccountSectionClass } from "@/lib/workspace-section-surface";

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
  heading: string;
  body: string;
};

function WorkspaceNoteCard({ heading, body }: WorkspaceNoteCardProps) {
  return (
    <div className={workspaceAccountSectionClass()}>
      <h2 className="ommm-h3 text-sage-800">{heading}</h2>
      <p className={`${adminChrome.ledeTight} mt-3`}>{body}</p>
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

export async function StaffAccountSummary({
  variant,
  locale,
}: {
  variant: Variant;
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "staffProfile" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MeRow>("/users/me", cookie);

  if (!res.ok) {
    return <div className="app-alert-warn max-w-xl">{t("loadError")}</div>;
  }

  const u = res.data.user;
  const title = staffVariantTitle(t, variant);
  const description = staffVariantDescription(t, variant);

  return (
    <div className="space-y-6">
      <div className={workspaceAccountSectionClass()}>
        <h1 className="ommm-h2">{title}</h1>
        <p className={adminChrome.lede}>{description}</p>
        <dl className="mt-6 space-y-3 text-sm">
          <div>
            <dt className={adminChrome.metricLabel}>{t("fields.email")}</dt>
            <dd className={adminChrome.panelHeading}>{u.email}</dd>
          </div>
          <div>
            <dt className={adminChrome.metricLabel}>{t("fields.name")}</dt>
            <dd className="text-sage-800">{u.name ?? "—"}</dd>
          </div>
          <div>
            <dt className={adminChrome.metricLabel}>{t("fields.role")}</dt>
            <dd className="text-sage-800">{u.role}</dd>
          </div>
        </dl>
      </div>
      {variant === "admin" || variant === "coach" || variant === "manager" ? (
        <WorkspaceNoteCard
          heading={workspaceHeading(t, variant)}
          body={workspaceBody(t, variant)}
        />
      ) : null}
    </div>
  );
}
