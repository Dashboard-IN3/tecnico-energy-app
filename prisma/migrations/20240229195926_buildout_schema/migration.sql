/*
  Warnings:

  - The primary key for the `scenario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `scenario` table. All the data in the column will be lost.
  - You are about to drop the column `themeId` on the `scenario` table. All the data in the column will be lost.
  - The primary key for the `study` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `study` table. All the data in the column will be lost.
  - You are about to drop the column `imageSrc` on the `study` table. All the data in the column will be lost.
  - The primary key for the `theme` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `theme` table. All the data in the column will be lost.
  - You are about to drop the column `studyId` on the `theme` table. All the data in the column will be lost.
  - You are about to drop the `buildings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `study_slug` to the `scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scale` to the `study` table without a default value. This is not possible if the table is not empty.
  - Added the required column `study_slug` to the `theme` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "study_scale" AS ENUM ('Municipality', 'Building');

-- DropForeignKey
ALTER TABLE "scenario" DROP CONSTRAINT "scenario_themeId_fkey";

-- DropForeignKey
ALTER TABLE "theme" DROP CONSTRAINT "theme_studyId_fkey";

-- DropIndex
DROP INDEX "scenario_slug_key";

-- DropIndex
DROP INDEX "study_slug_key";

-- DropIndex
DROP INDEX "theme_slug_key";

-- AlterTable
ALTER TABLE "scenario" DROP CONSTRAINT "scenario_pkey",
DROP COLUMN "id",
DROP COLUMN "themeId",
ADD COLUMN     "methodology" TEXT,
ADD COLUMN     "study_slug" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ADD CONSTRAINT "scenario_pkey" PRIMARY KEY ("slug");

-- AlterTable
ALTER TABLE "study" DROP CONSTRAINT "study_pkey",
DROP COLUMN "id",
DROP COLUMN "imageSrc",
ADD COLUMN     "bbox" DOUBLE PRECISION[] DEFAULT ARRAY[0, 0, 0, 0]::DOUBLE PRECISION[],
ADD COLUMN     "centroid_coordinates" DOUBLE PRECISION[] DEFAULT ARRAY[0, 0]::DOUBLE PRECISION[],
ADD COLUMN     "details" TEXT,
ADD COLUMN     "image_src" TEXT,
ADD COLUMN     "scale" "study_scale" NOT NULL,
ADD COLUMN     "zoom_level_start" INTEGER NOT NULL DEFAULT 14,
ADD CONSTRAINT "study_pkey" PRIMARY KEY ("slug");

-- AlterTable
ALTER TABLE "theme" DROP CONSTRAINT "theme_pkey",
DROP COLUMN "id",
DROP COLUMN "studyId",
ADD COLUMN     "study_slug" TEXT NOT NULL,
ADD CONSTRAINT "theme_pkey" PRIMARY KEY ("study_slug", "slug");

-- DropTable
DROP TABLE "buildings";

-- CreateTable
CREATE TABLE "geometries" (
    "name" TEXT NOT NULL,
    "study_slug" TEXT NOT NULL,
    "geom" geometry NOT NULL,
    "metricsStudy_slug" TEXT,
    "metricsGeometry_key" TEXT,

    CONSTRAINT "geometries_pkey" PRIMARY KEY ("study_slug","name")
);

-- CreateTable
CREATE TABLE "metrics_metadata" (
    "field_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "units" TEXT NOT NULL,
    "study_slug" TEXT NOT NULL,
    "theme_slug" TEXT NOT NULL,
    "category" TEXT,
    "usage" TEXT,
    "source" TEXT,
    "scenario_slug" TEXT,

    CONSTRAINT "metrics_metadata_pkey" PRIMARY KEY ("study_slug","field_name")
);

-- CreateTable
CREATE TABLE "metrics" (
    "study_slug" TEXT NOT NULL,
    "geometry_key" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "metrics_pkey" PRIMARY KEY ("study_slug","geometry_key")
);

-- CreateIndex
CREATE INDEX "geometries_study_slug_idx" ON "geometries"("study_slug");

-- CreateIndex
CREATE UNIQUE INDEX "metrics_study_slug_geometry_key_key" ON "metrics"("study_slug", "geometry_key");

-- CreateIndex
CREATE INDEX "theme_study_slug_idx" ON "theme"("study_slug");

-- AddForeignKey
ALTER TABLE "theme" ADD CONSTRAINT "theme_study_slug_fkey" FOREIGN KEY ("study_slug") REFERENCES "study"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario" ADD CONSTRAINT "scenario_study_slug_fkey" FOREIGN KEY ("study_slug") REFERENCES "study"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geometries" ADD CONSTRAINT "geometries_study_slug_fkey" FOREIGN KEY ("study_slug") REFERENCES "study"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geometries" ADD CONSTRAINT "geometries_metricsStudy_slug_metricsGeometry_key_fkey" FOREIGN KEY ("metricsStudy_slug", "metricsGeometry_key") REFERENCES "metrics"("study_slug", "geometry_key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics_metadata" ADD CONSTRAINT "metrics_metadata_study_slug_fkey" FOREIGN KEY ("study_slug") REFERENCES "study"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics_metadata" ADD CONSTRAINT "metrics_metadata_scenario_slug_fkey" FOREIGN KEY ("scenario_slug") REFERENCES "scenario"("slug") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_study_slug_fkey" FOREIGN KEY ("study_slug") REFERENCES "study"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
