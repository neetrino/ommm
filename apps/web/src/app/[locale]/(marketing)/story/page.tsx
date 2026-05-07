import { getTranslations } from "next-intl/server";

export default async function StoryPage() {
  const m = await getTranslations("marketing");

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
      <h1 className="app-page-heading">{m("storyTitle")}</h1>
      <p className="app-lede">{m("storyLead")}</p>
      <div className="mt-10 space-y-6 app-body-text">
        <p>{m("storyP1")}</p>
        <p>{m("storyP2")}</p>
      </div>
    </article>
  );
}
