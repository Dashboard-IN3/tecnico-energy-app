-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateTable
CREATE TABLE "buildings"(
    "name" text NOT NULL,
    "geom" geometry(polygon, 4326) NOT NULL,
    "properties" jsonb NOT NULL,
    CONSTRAINT "buildings_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "study"(
    "id" serial NOT NULL,
    "slug" text NOT NULL,
    "name" text NOT NULL,
    "description" text NOT NULL,
    "imageSrc" text NOT NULL,
    CONSTRAINT "study_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theme"(
    "id" serial NOT NULL,
    "slug" text NOT NULL,
    "name" text NOT NULL,
    "studyId" integer NOT NULL,
    CONSTRAINT "theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario"(
    "id" serial NOT NULL,
    "slug" text NOT NULL,
    "name" text NOT NULL,
    "description" text NOT NULL,
    "themeId" integer NOT NULL,
    CONSTRAINT "scenario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "study_slug_key" ON "study"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "theme_slug_key" ON "theme"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "scenario_slug_key" ON "scenario"("slug");

-- AddForeignKey
ALTER TABLE "theme"
    ADD CONSTRAINT "theme_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario"
    ADD CONSTRAINT "scenario_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

