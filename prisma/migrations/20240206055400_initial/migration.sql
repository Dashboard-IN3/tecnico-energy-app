-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateTable
CREATE TABLE "buildings" (
    "name" TEXT NOT NULL,
    "geom" geometry(Polygon, 4326) NOT NULL,
    "properties" JSONB NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "study" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageSrc" TEXT NOT NULL,

    CONSTRAINT "study_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theme" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "studyId" INTEGER NOT NULL,

    CONSTRAINT "theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "themeId" INTEGER NOT NULL,

    CONSTRAINT "scenario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "study_slug_key" ON "study"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "theme_slug_key" ON "theme"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "scenario_slug_key" ON "scenario"("slug");

-- AddForeignKey
ALTER TABLE "theme" ADD CONSTRAINT "theme_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario" ADD CONSTRAINT "scenario_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
