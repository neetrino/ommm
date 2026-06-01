import { headers } from "next/headers";
import { ACCOUNT_SESSION_RANGE_DAYS } from "@/lib/account-constants";
import { formatDateTimeForUi } from "@/lib/date-display";
import { serverApiJson } from "@/lib/server-api";

type ClassTypeRow = {
  id: string;
  name: string;
  slug: string;
};

type SessionRow = {
  id: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  status: string;
  classType: { name: string };
  coach: { user: { name: string | null } };
  _count: { bookings: number };
};

function getManagerClassesLabels(locale: string) {
  if (locale === "hy") {
    return {
      authRequired: "Պահանջվում է մենեջերի մուտք։",
      loadClassTypesFailed: "Չհաջողվեց բեռնել դասերի տեսակները ({status})։",
      loadSessionsFailed: "Չհաջողվեց բեռնել սեսիաները ({status})։",
      title: "Դասեր",
      description:
        "Նույն schedule window-ը, ինչ ադմինի մոտ ({days} օր)։ Սեսիաների ստեղծումն ու խմբագրումը անհրաժեշտության դեպքում մնում է ադմինի գործիքներում։",
      classTypesTitle: "Դասերի տեսակներ",
      sessionsTitle: "Առաջիկա սեսիաներ",
      colName: "Անուն",
      colSlug: "Slug",
      colClass: "Դաս",
      colStarts: "Սկիզբ",
      colCoach: "Մարզիչ",
      colBooked: "Ամրագրված",
      colStatus: "Կարգավիճակ",
    };
  }
  if (locale === "ru") {
    return {
      authRequired: "Нужен вход менеджера.",
      loadClassTypesFailed: "Не удалось загрузить типы классов ({status}).",
      loadSessionsFailed: "Не удалось загрузить сессии ({status}).",
      title: "Классы",
      description:
        "То же окно расписания, что и у админа ({days} дней). Создание и редактирование сессий при необходимости остаются в админ-инструментах.",
      classTypesTitle: "Типы классов",
      sessionsTitle: "Ближайшие сессии",
      colName: "Название",
      colSlug: "Slug",
      colClass: "Класс",
      colStarts: "Начало",
      colCoach: "Тренер",
      colBooked: "Записано",
      colStatus: "Статус",
    };
  }
  return {
    authRequired: "Manager sign-in required.",
    loadClassTypesFailed: "Could not load class types ({status}).",
    loadSessionsFailed: "Could not load sessions ({status}).",
    title: "Classes",
    description:
      "Same schedule window as admin ({days} days). Create and edit sessions remain in the admin tools when needed.",
    classTypesTitle: "Class types",
    sessionsTitle: "Upcoming sessions",
    colName: "Name",
    colSlug: "Slug",
    colClass: "Class",
    colStarts: "Starts",
    colCoach: "Coach",
    colBooked: "Booked",
    colStatus: "Status",
  };
}

export default async function ManagerClassesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const labels = getManagerClassesLabels(locale);
  const cookie = (await headers()).get("cookie") ?? "";
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + ACCOUNT_SESSION_RANGE_DAYS);
  const q = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;

  const [typesRes, sessionsRes] = await Promise.all([
    serverApiJson<ClassTypeRow[]>("/classes/types", cookie),
    serverApiJson<SessionRow[]>(`/classes/sessions?${q}`, cookie),
  ]);

  if (!typesRes.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {typesRes.status === 401 || typesRes.status === 403
          ? labels.authRequired
          : labels.loadClassTypesFailed.replace("{status}", String(typesRes.status))}
      </div>
    );
  }

  if (!sessionsRes.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {sessionsRes.status === 401 || sessionsRes.status === 403
          ? labels.authRequired
          : labels.loadSessionsFailed.replace("{status}", String(sessionsRes.status))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">{labels.title}</h1>
      <p className="mt-2 text-sm text-zinc-600">
        {labels.description.replace("{days}", String(ACCOUNT_SESSION_RANGE_DAYS))}
      </p>
      <h2 className="mt-8 text-lg font-medium text-zinc-900">{labels.classTypesTitle}</h2>
      <div className="mt-4 overflow-x-auto rounded-[24px] border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">{labels.colName}</th>
              <th className="px-4 py-3">{labels.colSlug}</th>
            </tr>
          </thead>
          <tbody>
            {typesRes.data.map((t) => (
              <tr key={t.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">{t.name}</td>
                <td className="px-4 py-3 text-zinc-600">{t.slug}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="mt-8 text-lg font-medium text-zinc-900">{labels.sessionsTitle}</h2>
      <div className="mt-4 overflow-x-auto rounded-[24px] border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">{labels.colClass}</th>
              <th className="px-4 py-3">{labels.colStarts}</th>
              <th className="px-4 py-3">{labels.colCoach}</th>
              <th className="px-4 py-3">{labels.colBooked}</th>
              <th className="px-4 py-3">{labels.colStatus}</th>
            </tr>
          </thead>
          <tbody>
            {sessionsRes.data.map((s) => (
              <tr key={s.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {s.classType.name}
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  {formatDateTimeForUi(s.startsAt)}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {s.coach.user.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {s._count.bookings}/{s.capacity}
                </td>
                <td className="px-4 py-3 text-zinc-600">{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
