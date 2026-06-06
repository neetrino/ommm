import { headers } from "next/headers";
import { Suspense } from "react";
import { ManagerListPagination } from "@/components/manager/manager-list-pagination";
import { parseListPageParams } from "@/lib/list-pagination";
import { serverApiJson } from "@/lib/server-api";

type CoachAdminRow = {
  id: string;
  bio: string | null;
  specialization: string | null;
  user: {
    name: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
};

type ManagerCoachesPayload = {
  items: CoachAdminRow[];
  total: number;
  take: number;
  offset: number;
};

function coachDisplayName(user: CoachAdminRow["user"]): string {
  const value = [user.name, user.lastName].filter(Boolean).join(" ").trim();
  return value.length > 0 ? value : "—";
}

function getManagerCoachesLabels(locale: string) {
  if (locale === "hy") {
    return {
      authRequired: "Պահանջվում է մենեջերի մուտք։",
      loadFailed: "Չհաջողվեց բեռնել մարզիչներին ({status})։",
      title: "Մարզիչներ",
      description:
        "Գործառնական ցուցակ (դիտում)։ Պրոֆիլի խմբագրումն ու lifecycle գործողությունները՝ ադմին CRM-ում։",
      colName: "Անուն",
      colEmail: "Էլ. փոստ",
      colPhone: "Հեռախոս",
      colSpecialization: "Մասնագիտացում",
    };
  }
  if (locale === "ru") {
    return {
      authRequired: "Нужен вход менеджера.",
      loadFailed: "Не удалось загрузить тренеров ({status}).",
      title: "Тренеры",
      description:
        "Операционный каталог (просмотр). Редактирование и deactivate/delete — в admin CRM.",
      colName: "Имя",
      colEmail: "Email",
      colPhone: "Телефон",
      colSpecialization: "Специализация",
    };
  }
  return {
    authRequired: "Manager sign-in required.",
    loadFailed: "Could not load coaches ({status}).",
    title: "Coaches",
    description:
      "Directory view (read-only). Edit and lifecycle actions are in admin CRM.",
    colName: "Name",
    colEmail: "Email",
    colPhone: "Phone",
    colSpecialization: "Specialization",
  };
}

export default async function ManagerCoachesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const labels = getManagerCoachesLabels(locale);
  const cookie = (await headers()).get("cookie") ?? "";
  const listPage = parseListPageParams(search);
  const res = await serverApiJson<ManagerCoachesPayload>(
    `/coaches/admin/list?take=${listPage.take}&offset=${listPage.offset}`,
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
        <table className="min-w-[34rem] w-full table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[30%]" />
            <col className="w-[22%]" />
            <col className="w-[20%]" />
          </colgroup>
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">{labels.colName}</th>
              <th className="px-4 py-3">{labels.colEmail}</th>
              <th className="px-4 py-3 text-center">{labels.colPhone}</th>
              <th className="px-4 py-3 text-center">{labels.colSpecialization}</th>
            </tr>
          </thead>
          <tbody>
            {res.data.items.map((coach) => (
              <tr key={coach.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {coachDisplayName(coach.user)}
                </td>
                <td className="px-4 py-3 text-zinc-700">{coach.user.email}</td>
                <td className="px-4 py-3 text-center text-zinc-700">
                  {coach.user.phone ?? "—"}
                </td>
                <td className="px-4 py-3 text-center text-zinc-600">
                  {coach.specialization ?? "—"}
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
