import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";
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

export default async function CoachesMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const m = await getTranslations({ locale, namespace: "marketing" });
  const res = await serverApiJson<PublicCoach[]>("/coaches", "");

  return (
    <MarketingPageFrame title={m("coachesPageTitle")} lede={m("coachesPageLead")}>
      {!res.ok ? (
        <p className="app-alert-warn mt-12" role="status">
          {m("coachesError")}
        </p>
      ) : res.data.length === 0 ? (
        <p
          className="ommm-card mt-12 p-5 text-sm text-sage-500 sm:p-6"
          role="status"
        >
          {m("coachesEmpty")}
        </p>
      ) : (
        <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {res.data.map((c) => (
            <li
              key={c.id}
              className="ommm-card ommm-marketing-card-hover flex min-h-[28rem] flex-col gap-6 p-6 shadow-[0_24px_55px_-26px_rgba(45,40,35,0.24)] sm:p-7"
            >
              <div
                className="relative h-56 w-full shrink-0 overflow-hidden rounded-[24px] bg-gradient-to-br from-mint-100/90 to-sand-100 ring-1 ring-white/70"
                aria-hidden
              >
                {c.user.avatarUrl ? (
                  <Image
                    src={c.user.avatarUrl}
                    alt=""
                    fill
                    sizes="(min-width:1024px) 22vw, (min-width:768px) 45vw, 92vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-sage-700">
                    {initials(c.user.name, c.user.email)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="ommm-h3 text-sage-800 sm:text-[1.4rem]">
                  {c.user.name?.trim() || c.user.email}
                </h2>
                {c.specialization ? (
                  <p className="mt-2 text-sm font-medium text-sand-700">
                    {c.specialization}
                  </p>
                ) : null}
                {c.experienceYears != null && c.experienceYears > 0 ? (
                  <p className="mt-3 text-sm text-sage-500">
                    {m("coachesExperience", { years: c.experienceYears })}
                  </p>
                ) : null}
                {c.bio ? (
                  <p className="mt-4 text-sm leading-relaxed text-sage-500">
                    {c.bio}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </MarketingPageFrame>
  );
}
