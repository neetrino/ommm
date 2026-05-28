import { Link } from "@/i18n/navigation";

function getContentAdminHomeLabels(locale: string) {
  if (locale === "hy") {
    return {
      title: "Բովանդակության աշխատատարածք",
      description:
        "Կառավարեք ստուդիայի գրառումները և խմբագրական բովանդակությունը։ Ձեր գործիքները բացելու համար օգտագործեք կողային մենյուն։",
      openContent: "Բացել բովանդակությունը",
      profile: "Պրոֆիլ",
    };
  }
  if (locale === "ru") {
    return {
      title: "Рабочее пространство контента",
      description:
        "Управляйте постами студии и редакционным контентом. Используйте боковое меню для открытия инструментов.",
      openContent: "Открыть контент",
      profile: "Профиль",
    };
  }
  return {
    title: "Content workspace",
    description:
      "Manage studio posts and editorial content. Use the sidebar to open your tools.",
    openContent: "Open content",
    profile: "Profile",
  };
}

export default async function ContentAdminHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const labels = getContentAdminHomeLabels(locale);
  return (
    <div className="rounded-[24px] border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-zinc-900">{labels.title}</h1>
      <p className="mt-2 text-sm text-zinc-600">{labels.description}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/content-admin/content"
          className="inline-flex rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
        >
          {labels.openContent}
        </Link>
        <Link
          href="/content-admin/profile"
          className="inline-flex rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
        >
          {labels.profile}
        </Link>
      </div>
    </div>
  );
}
