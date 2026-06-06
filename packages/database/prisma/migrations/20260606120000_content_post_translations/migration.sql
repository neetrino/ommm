-- CreateTable
CREATE TABLE "ContentPostTranslation" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "excerpt" TEXT,
    "body" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentPostTranslation_pkey" PRIMARY KEY ("id")
);

-- Seed English translations from existing posts; hy/ru start empty with locale-specific slugs.
INSERT INTO "ContentPostTranslation" (
    "id",
    "postId",
    "locale",
    "slug",
    "title",
    "excerpt",
    "body",
    "seoTitle",
    "seoDescription",
    "createdAt",
    "updatedAt"
)
SELECT
    'cpt_en_' || "id",
    "id",
    'en',
    "slug",
    "title",
    "excerpt",
    "body",
    "seoTitle",
    "seoDescription",
    "createdAt",
    "updatedAt"
FROM "ContentPost";

INSERT INTO "ContentPostTranslation" (
    "id",
    "postId",
    "locale",
    "slug",
    "title",
    "createdAt",
    "updatedAt"
)
SELECT
    'cpt_hy_' || "id",
    "id",
    'hy',
    "slug" || '-hy',
    '',
    "createdAt",
    "updatedAt"
FROM "ContentPost";

INSERT INTO "ContentPostTranslation" (
    "id",
    "postId",
    "locale",
    "slug",
    "title",
    "createdAt",
    "updatedAt"
)
SELECT
    'cpt_ru_' || "id",
    "id",
    'ru',
    "slug" || '-ru',
    '',
    "createdAt",
    "updatedAt"
FROM "ContentPost";

-- CreateIndex
CREATE UNIQUE INDEX "ContentPostTranslation_postId_locale_key" ON "ContentPostTranslation"("postId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "ContentPostTranslation_locale_slug_key" ON "ContentPostTranslation"("locale", "slug");

-- CreateIndex
CREATE INDEX "ContentPostTranslation_postId_idx" ON "ContentPostTranslation"("postId");

-- AddForeignKey
ALTER TABLE "ContentPostTranslation" ADD CONSTRAINT "ContentPostTranslation_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ContentPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
