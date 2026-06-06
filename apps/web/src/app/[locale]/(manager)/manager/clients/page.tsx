import { headers } from "next/headers";
import { Suspense } from "react";
import type { AdminClientsPayload } from "@/components/admin/admin-clients-types";
import { ManagerListPagination } from "@/components/manager/manager-list-pagination";
import { formatDateForUi } from "@/lib/date-display";
import { parseListPageParams } from "@/lib/list-pagination";
import { serverApiJson } from "@/lib/server-api";

function getManagerClientsLabels(locale: string) {
  if (locale === "hy") {
    return {
      authRequired: "Պահանջվում է մենեջերի կամ ադմինի մուտք։",
      loadFailed: "Չհաջողվեց բեռնել հաճախորդներին ({status})։",
      title: "Հաճախորդներ",
      description: "Հաճախորդների ցուցակ (դիտում)։ Խմբագրումը՝ ադմին CRM-ում։",
      colName: "Անուն",
      colEmail: "Էլ. փոստ",
      colRole: "Տեսակ",
      colJoined: "Միացել է",
      roleClient: "Հաճախորդ",
    };
  }
  if (locale === "ru") {
    return {
      authRequired: "Нужен вход менеджера или админа.",
      loadFailed: "Не удалось загрузить клиентов ({status}).",
      title: "Клиенты",
      description: "Каталог клиентов (просмотр). Редактирование — в admin CRM.",
      colName: "Имя",
      colEmail: "Email",
      colRole: "Тип",
      colJoined: "Дата регистрации",
      roleClient: "Клиент",
    };
  }
  return {
    authRequired: "Manager or admin sign-in required.",
    loadFailed: "Could not load clients ({status}).",
    title: "Clients",
    description: "Client directory (read-only). Edit in admin CRM.",
    colName: "Name",
    colEmail: "Email",
    colRole: "Type",
    colJoined: "Joined",
    roleClient: "Client",
  };
}

export default async function ManagerClientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const labels = getManagerClientsLabels(locale);
  const cookie = (await headers()).get("cookie") ?? "";
  const listPage = parseListPageParams(search);
  const res = await serverApiJson<AdminClientsPayload>(
    `/clients?meta=true&take=${listPage.take}&offset=${listPage.offset}`,
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

  const rows = res.data.rows;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">{labels.title}</h1>
      <p className="mt-2 text-sm text-zinc-600">{labels.description}</p>
      <div className="mt-6 overflow-x-auto rounded-[24px] border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">{labels.colName}</th>
              <th className="px-4 py-3">{labels.colEmail}</th>
              <th className="px-4 py-3">{labels.colRole}</th>
              <th className="px-4 py-3">{labels.colJoined}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((client) => (
              <tr key={client.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {[client.name, client.lastName].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="px-4 py-3 text-zinc-700">{client.email}</td>
                <td className="px-4 py-3 text-zinc-600">{labels.roleClient}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {formatDateForUi(client.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <Suspense fallback={null}>
          <ManagerListPagination
            total={res.data.pagination.total}
            page={listPage.page}
            pageSize={listPage.pageSize}
            offset={listPage.offset}
          />
        </Suspense>
      </div>
    </div>
  );
}
