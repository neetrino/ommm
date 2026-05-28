import { headers } from "next/headers";
import { AdminCoachActions } from "@/components/admin/admin-coach-actions";
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

function coachDisplayName(u: CoachAdminRow["user"]): string {
  const s = [u.name, u.lastName].filter(Boolean).join(" ").trim();
  return s.length > 0 ? s : "—";
}

function getManagerCoachesLabels(locale: string) {
  if (locale === "hy") {
    return {
      authRequired: "Պահանջվում է մենեջերի մուտք։",
      loadFailed: "Չհաջողվեց բեռնել մարզիչներին ({status})։",
      title: "Մարզիչներ",
      description:
        "Գործառնական ցուցակ։ Մարզիչի պրոֆիլի deactivate/delete գործողությունները մնում են միայն ադմինին՝ CRM պահանջով։",
      colName: "Անուն",
      colEmail: "Էլ. փոստ",
      colPhone: "Հեռախոս",
      colSpecialization: "Մասնագիտացում",
      colActions: "Գործողություններ",
    };
  }
  if (locale === "ru") {
    return {
      authRequired: "Нужен вход менеджера.",
      loadFailed: "Не удалось загрузить тренеров ({status}).",
      title: "Тренеры",
      description:
        "Операционный каталог. Деактивация/удаление профилей тренеров остаётся только у админа по CRM-матрице.",
      colName: "Имя",
      colEmail: "Email",
      colPhone: "Телефон",
      colSpecialization: "Специализация",
      colActions: "Действия",
    };
  }
  return {
    authRequired: "Manager sign-in required.",
    loadFailed: "Could not load coaches ({status}).",
    title: "Coaches",
    description:
      "Directory view for operations. Deactivate/delete coach profiles stay admin-only per CRM.",
    colName: "Name",
    colEmail: "Email",
    colPhone: "Phone",
    colSpecialization: "Specialization",
    colActions: "Actions",
  };
}

export default async function ManagerCoachesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const labels = getManagerCoachesLabels(locale);
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<CoachAdminRow[]>("/coaches/admin/list", cookie);

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
            <col className="w-[24%]" />
            <col className="w-[26%]" />
            <col className="w-[18%]" />
            <col className="w-[20%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">{labels.colName}</th>
              <th className="px-4 py-3">{labels.colEmail}</th>
              <th className="px-4 py-3 text-center">{labels.colPhone}</th>
              <th className="px-4 py-3 text-center">{labels.colSpecialization}</th>
              <th className="px-4 py-3 text-center">{labels.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((c) => (
              <tr key={c.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {coachDisplayName(c.user)}
                </td>
                <td className="px-4 py-3 text-zinc-700">{c.user.email}</td>
                <td className="px-4 py-3 text-center text-zinc-700">
                  {c.user.phone ?? "—"}
                </td>
                <td className="px-4 py-3 text-center text-zinc-600">
                  {c.specialization ?? "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  <AdminCoachActions
                    coachId={c.id}
                    locale={locale}
                    initialSpecialization={c.specialization ?? ""}
                    initialBio={c.bio ?? ""}
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
