import { getTranslations } from "next-intl/server";

type WaitlistTone = "light" | "dark" | "warm" | "cool";

type WaitlistEntry = {
  id: string;
  spot: string;
  titleKey: "items.deepStretch" | "items.reformer" | "items.soundBath" | "items.vinyasa";
  whenKey: "when.thu" | "when.sat" | "when.fri" | "when.sun";
  tone: WaitlistTone;
};

const TONE_CARD: Record<WaitlistTone, string> = {
  light: "bg-white/65 ommm-card-organic ring-1 ring-white/60",
  dark: "bg-sage-900/85 text-cream-50 ommm-card-organic-mirror",
  warm: "bg-sand-100/70 ommm-card-organic-mirror ring-1 ring-white/60",
  cool: "bg-blue-100/60 ommm-card-organic ring-1 ring-white/60",
};

const TONE_TITLE: Record<WaitlistTone, string> = {
  light: "text-sage-900",
  dark: "text-white",
  warm: "text-sage-900",
  cool: "text-sage-900",
};

const TONE_META: Record<WaitlistTone, string> = {
  light: "text-sage-700",
  dark: "text-cream-50/85",
  warm: "text-sand-700",
  cool: "text-sage-700",
};

const TONE_SUB: Record<WaitlistTone, string> = {
  light: "text-sage-500",
  dark: "text-cream-50/65",
  warm: "text-sand-700/80",
  cool: "text-sage-500",
};

const ENTRIES: WaitlistEntry[] = [
  { id: "deep-stretch", spot: "#2", titleKey: "items.deepStretch", whenKey: "when.thu", tone: "light" },
  { id: "reformer", spot: "#5", titleKey: "items.reformer", whenKey: "when.sat", tone: "dark" },
  { id: "sound-bath", spot: "#3", titleKey: "items.soundBath", whenKey: "when.fri", tone: "warm" },
  { id: "vinyasa", spot: "#7", titleKey: "items.vinyasa", whenKey: "when.sun", tone: "cool" },
];

export async function WaitlistGrid() {
  const t = await getTranslations("home.waitlist");

  return (
    <section className="ommm-bg-wellness relative">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
      >
        <div className="absolute left-1/3 top-1/3 h-72 w-72 rounded-full bg-peach-100/50 blur-3xl" />
      </div>

      <div className="ommm-container ommm-section relative">
        <header className="mb-8 flex items-end justify-between gap-6 sm:mb-10">
          <h2 className="ommm-h2">{t("title")}</h2>
          <p className="hidden max-w-md text-sm text-sage-500 sm:block">
            {t("lead")}
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ENTRIES.map((entry) => (
            <li
              key={entry.id}
              className={`flex flex-col gap-2 p-7 backdrop-blur-md transition-transform hover:-translate-y-0.5 ${TONE_CARD[entry.tone]}`}
            >
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${TONE_META[entry.tone]}`}
              >
                {t("spotLabel", { spot: entry.spot })}
              </p>
              <p
                className={`text-lg font-semibold leading-tight ${TONE_TITLE[entry.tone]}`}
              >
                {t(entry.titleKey)}
              </p>
              <p className={`text-xs ${TONE_SUB[entry.tone]}`}>
                {t(entry.whenKey)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
