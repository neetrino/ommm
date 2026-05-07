import { getTranslations } from "next-intl/server";
import { serverApiJson } from "@/lib/server-api";

type PublicCoach = {
  id: string;
  bio: string | null;
  specialization: string | null;
  experienceYears: number | null;
  user: { name: string | null; email: string; avatarUrl: string | null };
};

function initials(name: string | null, email: string) {
  const n = name?.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0];
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return `${a ?? ""}${b ?? ""}`.toUpperCase() || "?";
  }
  return email[0]?.toUpperCase() ?? "?";
}

export default async function CoachesMarketingPage() {
  const m = await getTranslations("marketing");
  const res = await serverApiJson<PublicCoach[]>("/coaches", "");

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
      <h1 className="app-page-heading">{m("coachesPageTitle")}</h1>
      <p className="app-lede">{m("coachesPageLead")}</p>

      {!res.ok ? (
        <p className="app-alert-warn mt-10" role="status">
          {m("coachesError")}
        </p>
      ) : res.data.length === 0 ? (
        <p className="app-alert-info mt-10" role="status">
          {m("coachesEmpty")}
        </p>
      ) : (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {res.data.map((c) => (
            <li key={c.id} className="app-surface-card flex gap-4 p-6">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200/80 text-sm font-semibold text-zinc-700"
                aria-hidden
              >
                {initials(c.user.name, c.user.email)}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-zinc-900">
                  {c.user.name?.trim() || c.user.email}
                </h2>
                {c.specialization ? (
                  <p className="mt-1 text-sm font-medium text-zinc-500">
                    {c.specialization}
                  </p>
                ) : null}
                {c.experienceYears != null && c.experienceYears > 0 ? (
                  <p className="mt-2 text-xs text-zinc-500">
                    {m("coachesExperience", { years: c.experienceYears })}
                  </p>
                ) : null}
                {c.bio ? (
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                    {c.bio}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
