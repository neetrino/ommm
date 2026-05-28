import { headers } from "next/headers";
import { AdminBookingActions } from "@/components/admin/admin-booking-actions";
import { formatDateTimeForUi } from "@/lib/date-display";
import { serverApiJson } from "@/lib/server-api";

type BookingAdminRow = {
  id: string;
  status: string;
  user: { name: string | null; email: string };
  session: {
    id: string;
    startsAt: string;
    classType: { name: string };
  };
};

function getManagerBookingsLabels(locale: string) {
  if (locale === "hy") {
    return {
      authRequired: "Պահանջվում է մարզիչի, մենեջերի կամ ադմինի մուտք։",
      loadFailed: "Չհաջողվեց բեռնել ամրագրումները ({status})։",
      title: "Ամրագրումներ",
      description: "Շարժական միջակայք API-ից (մարզիչը roster-ը տեսնում է coach panel ֆիլտրերով)։",
      colMember: "Անդամ",
      colClass: "Դաս",
      colStarts: "Սկիզբ",
      colStatus: "Կարգավիճակ",
      colActions: "Գործողություններ",
    };
  }
  if (locale === "ru") {
    return {
      authRequired: "Нужен вход тренера, менеджера или админа.",
      loadFailed: "Не удалось загрузить бронирования ({status}).",
      title: "Бронирования",
      description: "Скользящее окно из API (тренер видит состав через фильтры coach panel).",
      colMember: "Участник",
      colClass: "Класс",
      colStarts: "Начало",
      colStatus: "Статус",
      colActions: "Действия",
    };
  }
  return {
    authRequired: "Coach, manager, or admin sign-in required.",
    loadFailed: "Could not load bookings ({status}).",
    title: "Bookings",
    description: "Rolling window from API (coach sees roster via coach panel filters).",
    colMember: "Member",
    colClass: "Class",
    colStarts: "Starts",
    colStatus: "Status",
    colActions: "Actions",
  };
}

export default async function ManagerBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const labels = getManagerBookingsLabels(locale);
  const cookie = (await headers()).get("cookie") ?? "";
  const from = new Date();
  from.setDate(from.getDate() - 7);
  const to = new Date();
  to.setDate(to.getDate() + 30);
  const q = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;

  const res = await serverApiJson<BookingAdminRow[]>(
    `/bookings/admin?${q}`,
    cookie,
  );

  if (!res.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {res.status === 401 || res.status === 403
          ? labels.authRequired
          : labels.loadFailed.replace("{status}", String(res.status))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">{labels.title}</h1>
      <p className="mt-2 text-sm text-zinc-600">{labels.description}</p>
      <div className="mt-6 overflow-x-auto rounded-[24px] border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">{labels.colMember}</th>
              <th className="px-4 py-3">{labels.colClass}</th>
              <th className="px-4 py-3">{labels.colStarts}</th>
              <th className="px-4 py-3">{labels.colStatus}</th>
              <th className="px-4 py-3">{labels.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((b) => (
              <tr key={b.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 text-zinc-900">
                  <span className="font-medium">
                    {b.user.name ?? b.user.email}
                  </span>
                  <br />
                  <span className="text-xs text-zinc-500">{b.user.email}</span>
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  {b.session.classType.name}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {formatDateTimeForUi(b.session.startsAt)}
                </td>
                <td className="px-4 py-3 text-zinc-600">{b.status}</td>
                <td className="px-4 py-3">
                  <AdminBookingActions
                    bookingId={b.id}
                    defaultSessionId={b.session.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
