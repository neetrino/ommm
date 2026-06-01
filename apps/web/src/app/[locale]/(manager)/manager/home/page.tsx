import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { Link } from "@/i18n/navigation";
import { isManagerDashboardRole } from "@/lib/role-home";
import { serverApiJson } from "@/lib/server-api";
import { redirectToRoleHome } from "@/server/redirect-to-role-home";

type MeResponse = {
  user: { role: string; name: string | null };
};

type DashboardSummary = {
  sessionsToday: number;
  bookingsToday: number;
  activeWaitlists: number;
  activeMembers: number;
};

function getManagerHomeLabels(locale: string) {
  if (locale === "hy") {
    return {
      signInRequired: "Մուտք գործեք՝ մենեջերի աշխատատարածքը բացելու համար։",
      title: "Մենեջերի աշխատատարածք",
      intro: "Բարև{name} — ստուդիայի գործառնական ակնարկ։ Օգտագործեք Bookings և Clients բաժինները՝ ըստ ձեր հասանելիության։",
      nextStepsTitle: "Հաջորդ քայլեր",
      nextStepsBody:
        "Կառավարեք դասերը, ամրագրումները, սպասման ցուցակները, հաճախորդներին, մարզիչներին և նվեր քարտերը։ Վճարումները և ստուդիայի գլոբալ կարգավորումները մնում են միայն ադմինի տիրույթում։",
      sessionsToday: "Այսօրվա սեսիաներ",
      bookingsToday: "Այսօրվա ամրագրումներ",
      activeWaitlists: "Ակտիվ սպասման ցուցակներ",
      activeMembers: "Ակտիվ անդամներ",
    };
  }
  if (locale === "ru") {
    return {
      signInRequired: "Войдите, чтобы открыть рабочее пространство менеджера.",
      title: "Рабочее пространство менеджера",
      intro:
        "Привет{name} — обзор операционных показателей студии. Используйте разделы Bookings и Clients в рамках ваших доступов.",
      nextStepsTitle: "Следующие шаги",
      nextStepsBody:
        "Управляйте классами, бронированиями, листами ожидания, клиентами, тренерами и подарочными картами. Биллинг и глобальные настройки студии остаются только для админа.",
      sessionsToday: "Сессий сегодня",
      bookingsToday: "Бронирований сегодня",
      activeWaitlists: "Активные листы ожидания",
      activeMembers: "Активные участники",
    };
  }
  return {
    signInRequired: "Sign in to open the manager workspace.",
    title: "Manager workspace",
    intro:
      "Hi{name} — studio operations overview. Use Bookings and Clients when your account has access.",
    nextStepsTitle: "Next steps",
    nextStepsBody:
      "Manage classes, bookings, waitlists, clients, coaches, and gift cards. Billing and studio-level settings remain admin-only.",
    sessionsToday: "Sessions today",
    bookingsToday: "Bookings today",
    activeWaitlists: "Active waitlists",
    activeMembers: "Active members",
  };
}

export default async function ManagerHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const labels = getManagerHomeLabels(locale);
  const cookie = (await headers()).get("cookie") ?? "";

  const [meRes, dashboardRes] = await Promise.all([
    serverApiJson<MeResponse>("/users/me", cookie),
    serverApiJson<DashboardSummary>("/reports/dashboard", cookie),
  ]);
  if (!meRes.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p>{labels.signInRequired}</p>
        <Link href="/login" className="ommm-cta-primary mt-4 inline-flex text-sm">
          {tCommon("login")}
        </Link>
      </div>
    );
  }

  if (!isManagerDashboardRole(meRes.data.user.role)) {
    redirectToRoleHome(locale, meRes.data.user.role);
  }

  const name = meRes.data.user.name?.trim();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        {labels.title}
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        {labels.intro.replace("{name}", name ? `, ${name}` : "")}
      </p>
      <section className="mt-8 rounded-[24px] border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm">
        <p className="font-medium text-zinc-900">{labels.nextStepsTitle}</p>
        <p className="mt-2 text-zinc-600">
          {labels.nextStepsBody}
        </p>
      </section>
      {dashboardRes.ok ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <li className="rounded-[20px] border border-zinc-200 bg-white p-4 text-sm shadow-sm">
            <p className="text-xs uppercase text-zinc-500">{labels.sessionsToday}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {dashboardRes.data.sessionsToday}
            </p>
          </li>
          <li className="rounded-[20px] border border-zinc-200 bg-white p-4 text-sm shadow-sm">
            <p className="text-xs uppercase text-zinc-500">{labels.bookingsToday}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {dashboardRes.data.bookingsToday}
            </p>
          </li>
          <li className="rounded-[20px] border border-zinc-200 bg-white p-4 text-sm shadow-sm">
            <p className="text-xs uppercase text-zinc-500">{labels.activeWaitlists}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {dashboardRes.data.activeWaitlists}
            </p>
          </li>
          <li className="rounded-[20px] border border-zinc-200 bg-white p-4 text-sm shadow-sm">
            <p className="text-xs uppercase text-zinc-500">{labels.activeMembers}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {dashboardRes.data.activeMembers}
            </p>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
