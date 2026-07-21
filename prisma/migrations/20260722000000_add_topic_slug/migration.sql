ALTER TABLE "Topic" ADD COLUMN "slug" TEXT;

UPDATE "Topic"
SET "slug" = lower(trim(both '-' from regexp_replace("name", '[^a-zA-Z0-9]+', '-', 'g')))
WHERE "slug" IS NULL;

ALTER TABLE "Topic" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Topic_subjectId_slug_key" ON "Topic"("subjectId", "slug");
