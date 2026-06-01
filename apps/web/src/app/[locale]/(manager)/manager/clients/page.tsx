import { headers } from "next/headers";
import { AdminClientActions } from "@/components/admin/admin-client-actions";
import { formatDateForUi } from "@/lib/date-display";
import { serverApiJson } from "@/lib/server-api";

type ClientRow = {
  id: string;
  email: string;
  name: string | null;
  lastName?: string | null;
  phone?: string | null;
  role: string;
  createdAt: string;
};

function getManagerClientsLabels(locale: string) {
  if (locale === "hy") {
    return {
      authRequired: "Պահանջվում է մենեջերի կամ ադմինի մուտք։",
      loadFailed: "Չհաջողվեց բեռնել հաճախորդներին ({status})։",
      title: "Հաճախորդներ",
      description: "Հաճախորդների ցուցակ։",
      colName: "Անուն",
      colEmail: "Էլ. փոստ",
      colRole: "Դեր",
      colJoined: "Միացել է",
      colActions: "Գործողություններ",
    };
  }
  if (locale === "ru") {
    return {
      authRequired: "Нужен вход менеджера или админа.",
      loadFailed: "Не удалось загрузить клиентов ({status}).",
      title: "Клиенты",
      description: "Каталог клиентов.",
      colName: "Имя",
      colEmail: "Email",
      colRole: "Роль",
      colJoined: "Дата регистрации",
      colActions: "Действия",
    };
  }
  return {
    authRequired: "Manager or admin sign-in required.",
    loadFailed: "Could not load clients ({status}).",
    title: "Clients",
    description: "Client directory.",
    colName: "Name",
    colEmail: "Email",
    colRole: "Role",
    colJoined: "Joined",
    colActions: "Actions",
  };
}

export default async function ManagerClientsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const labels = getManagerClientsLabels(locale);
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<ClientRow[]>("/clients", cookie);

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
              <th className="px-4 py-3">{labels.colName}</th>
              <th className="px-4 py-3">{labels.colEmail}</th>
              <th className="px-4 py-3">{labels.colRole}</th>
              <th className="px-4 py-3">{labels.colJoined}</th>
              <th className="px-4 py-3">{labels.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((c) => (
              <tr key={c.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {c.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-700">{c.email}</td>
                <td className="px-4 py-3 text-zinc-600">{c.role}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {formatDateForUi(c.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <AdminClientActions
                    clientId={c.id}
                    initialEmail={c.email}
                    initialName={c.name ?? ""}
                    initialLastName={c.lastName ?? ""}
                    initialPhone={c.phone ?? ""}
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
