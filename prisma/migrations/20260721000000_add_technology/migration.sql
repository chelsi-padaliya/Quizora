CREATE TABLE "Technology" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Technology_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Technology_name_key" ON "Technology"("name");
CREATE UNIQUE INDEX "Technology_slug_key" ON "Technology"("slug");
CREATE INDEX "Technology_slug_idx" ON "Technology"("slug");

INSERT INTO "Technology" ("id", "name", "slug", "updatedAt")
VALUES ('legacy-technology', 'Uncategorized', 'uncategorized', CURRENT_TIMESTAMP);

ALTER TABLE "Subject" ADD COLUMN "technologyId" TEXT;
UPDATE "Subject" SET "technologyId" = 'legacy-technology' WHERE "technologyId" IS NULL;
ALTER TABLE "Subject" ALTER COLUMN "technologyId" SET NOT NULL;
CREATE INDEX "Subject_technologyId_idx" ON "Subject"("technologyId");
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE CASCADE ON UPDATE CASCADE;
