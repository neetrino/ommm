import { getTranslations } from "next-intl/server";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";
import { ContactMessageForm } from "@/components/marketing/contact-message-form";
import { serverApiJson } from "@/lib/server-api";

type StudioPublic = {
  studioName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  whatsappUrl: string | null;
  address: string | null;
  mapEmbedUrl: string | null;
  workingHours: string | null;
  socialLinksJson: string | null;
};

function parseSocialLinks(raw: string | null): { label: string; url: string }[] {
  if (raw === null || raw.trim() === "") {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter(
        (row): row is { label: string; url: string } =>
          typeof row === "object" &&
          row !== null &&
          "label" in row &&
          "url" in row &&
          typeof (row as { label: unknown }).label === "string" &&
          typeof (row as { url: unknown }).url === "string",
      )
      .map((row) => ({ label: row.label, url: row.url }));
  } catch {
    return [];
  }
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketingPages.contact" });
  const studioRes = await serverApiJson<StudioPublic>("/studio", "");
  const studio = studioRes.ok ? studioRes.data : null;
  const social = studio !== null ? parseSocialLinks(studio.socialLinksJson) : [];

  return (
    <MarketingPageFrame title={t("title")} lede={t("lede")}>
      {studio !== null ? (
        <section className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="ommm-card p-6 text-sm text-sage-700 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8">
            <h2 className="ommm-h3 text-sage-800">{t("studioHeading")}</h2>
            <dl className="mt-4 space-y-3">
              {studio.contactPhone !== null ? (
                <div>
                  <dt className="text-xs font-semibold uppercase text-sage-500">
                    {t("phone")}
                  </dt>
                  <dd>
                    <a
                      href={`tel:${studio.contactPhone.replace(/\s+/g, "")}`}
                      className="text-sage-800 underline-offset-2 hover:underline"
                    >
                      {studio.contactPhone}
                    </a>
                  </dd>
                </div>
              ) : null}
              {studio.contactEmail !== null ? (
                <div>
                  <dt className="text-xs font-semibold uppercase text-sage-500">
                    {t("email")}
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${studio.contactEmail}`}
                      className="text-sage-800 underline-offset-2 hover:underline"
                    >
                      {studio.contactEmail}
                    </a>
                  </dd>
                </div>
              ) : null}
              {studio.whatsappUrl !== null ? (
                <div>
                  <dt className="text-xs font-semibold uppercase text-sage-500">
                    {t("whatsApp")}
                  </dt>
                  <dd>
                    <a
                      href={studio.whatsappUrl}
                      className="text-sage-800 underline-offset-2 hover:underline"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {t("chatWhatsApp")}
                    </a>
                  </dd>
                </div>
              ) : null}
              {studio.address !== null ? (
                <div>
                  <dt className="text-xs font-semibold uppercase text-sage-500">
                    {t("address")}
                  </dt>
                  <dd className="whitespace-pre-line">{studio.address}</dd>
                </div>
              ) : null}
              {studio.workingHours !== null ? (
                <div>
                  <dt className="text-xs font-semibold uppercase text-sage-500">
                    {t("hours")}
                  </dt>
                  <dd className="whitespace-pre-line">{studio.workingHours}</dd>
                </div>
              ) : null}
            </dl>
            {social.length > 0 ? (
              <ul className="mt-6 flex flex-wrap gap-3">
                {social.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      className="ommm-cta-ghost text-sm"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div>
            <ContactMessageForm formClassName="ommm-card flex w-full max-w-lg flex-col gap-4 p-6 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8" />
          </div>
        </section>
      ) : (
        <ContactMessageForm />
      )}
      {studio !== null &&
      studio.mapEmbedUrl !== null &&
      studio.mapEmbedUrl.trim() !== "" ? (
        <section className="mt-12">
          <h2 className="ommm-h3 text-sage-800">{t("mapHeading")}</h2>
          <div
            className="mt-4 overflow-hidden rounded-[24px] border border-white/60 bg-white shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)]"
            dangerouslySetInnerHTML={{ __html: studio.mapEmbedUrl }}
          />
        </section>
      ) : null}
    </MarketingPageFrame>
  );
}
