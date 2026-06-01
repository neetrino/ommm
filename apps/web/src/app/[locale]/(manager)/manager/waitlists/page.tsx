import { headers } from "next/headers";
import { AdminWaitlistActions } from "@/components/admin/admin-waitlist-actions";
import { formatDateTimeForUi } from "@/lib/date-display";
import { serverApiJson } from "@/lib/server-api";

type WaitlistAdminRow = {
  id: string;
  position: number;
  status: string;
  offeredAt: string | null;
  offerExpiresAt: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  session: { id: string; startsAt: string; classType: { name: string } };
};

function getManagerWaitlistsLabels(locale: string) {
  if (locale === "hy") {
    return {
      authRequired: "Պահանջվում է մենեջերի մուտք։",
      loadFailed: "Չհաջողվեց բեռնել սպասման ցուցակները ({status})։",
      title: "Սպասման ցուցակներ",
      description:
        "Գործառնական տեսք՝ CRM manager matrix-ին համահունչ (տեղափոխում/հեռացում՝ API-ով կամ ապագա row action-ներով)։",
      colUser: "Օգտատեր",
      colClass: "Դաս",
      colSession: "Սեսիա",
      colPos: "Դիրք",
      colStatus: "Կարգավիճակ",
      colOfferExpires: "Առաջարկի ավարտ",
      colActions: "Գործողություններ",
    };
  }
  if (locale === "ru") {
    return {
      authRequired: "Нужен вход менеджера.",
      loadFailed: "Не удалось загрузить лист ожидания ({status}).",
      title: "Листы ожидания",
      description:
        "Операционный вид в рамках CRM manager matrix (перемещение/удаление через API или будущие row actions).",
      colUser: "Пользователь",
      colClass: "Класс",
      colSession: "Сессия",
      colPos: "Поз.",
      colStatus: "Статус",
      colOfferExpires: "Истекает оффер",
      colActions: "Действия",
    };
  }
  return {
    authRequired: "Manager sign-in required.",
    loadFailed: "Could not load waitlists ({status}).",
    title: "Waitlists",
    description:
      "Operational view aligned with the CRM manager matrix (move/remove via API or future row actions).",
    colUser: "User",
    colClass: "Class",
    colSession: "Session",
    colPos: "Pos",
    colStatus: "Status",
    colOfferExpires: "Offer expires",
    colActions: "Actions",
  };
}

export default async function ManagerWaitlistsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const labels = getManagerWaitlistsLabels(locale);
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<WaitlistAdminRow[]>(
    "/waitlist/admin/recent?take=200",
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
              <th className="px-4 py-3">{labels.colUser}</th>
              <th className="px-4 py-3">{labels.colClass}</th>
              <th className="px-4 py-3">{labels.colSession}</th>
              <th className="px-4 py-3">{labels.colPos}</th>
              <th className="px-4 py-3">{labels.colStatus}</th>
              <th className="px-4 py-3">{labels.colOfferExpires}</th>
              <th className="px-4 py-3">{labels.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((w) => (
              <tr key={w.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 text-zinc-900">
                  <div className="font-medium">{w.user.name ?? "—"}</div>
                  <div className="text-xs text-zinc-500">{w.user.email}</div>
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  {w.session.classType.name}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {formatDateTimeForUi(w.session.startsAt)}
                </td>
                <td className="px-4 py-3 text-zinc-600">{w.position}</td>
                <td className="px-4 py-3 text-zinc-600">{w.status}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {w.offerExpiresAt
                    ? formatDateTimeForUi(w.offerExpiresAt)
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <AdminWaitlistActions entryId={w.id} sessionId={w.session.id} locale={locale} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
