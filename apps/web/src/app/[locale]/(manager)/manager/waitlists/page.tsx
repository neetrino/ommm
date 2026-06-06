import { headers } from "next/headers";
import { Suspense } from "react";
import { AdminWaitlistActions } from "@/components/admin/admin-waitlist-actions";
import { ManagerListPagination } from "@/components/manager/manager-list-pagination";
import { formatDateTimeForUi } from "@/lib/date-display";
import { parseListPageParams } from "@/lib/list-pagination";
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

type ManagerWaitlistsPayload = {
  items: WaitlistAdminRow[];
  total: number;
  take: number;
  offset: number;
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
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const labels = getManagerWaitlistsLabels(locale);
  const cookie = (await headers()).get("cookie") ?? "";
  const listPage = parseListPageParams(search);
  const res = await serverApiJson<ManagerWaitlistsPayload>(
    `/waitlist/admin/active?take=${listPage.take}&offset=${listPage.offset}`,
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
            {res.data.items.map((entry) => (
              <tr key={entry.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 text-zinc-900">
                  <div className="font-medium">{entry.user.name ?? "—"}</div>
                  <div className="text-xs text-zinc-500">{entry.user.email}</div>
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  {entry.session.classType.name}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {formatDateTimeForUi(entry.session.startsAt, locale)}
                </td>
                <td className="px-4 py-3 text-zinc-600">{entry.position}</td>
                <td className="px-4 py-3 text-zinc-600">{entry.status}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {entry.offerExpiresAt
                    ? formatDateTimeForUi(entry.offerExpiresAt, locale)
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <AdminWaitlistActions
                    entryId={entry.id}
                    sessionId={entry.session.id}
                    locale={locale}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <Suspense fallback={null}>
          <ManagerListPagination
            total={res.data.total}
            page={listPage.page}
            pageSize={listPage.pageSize}
            offset={listPage.offset}
          />
        </Suspense>
      </div>
    </div>
  );
}
