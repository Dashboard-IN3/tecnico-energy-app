/*
  Warnings:

  - The primary key for the `scenario` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "metrics_metadata" DROP CONSTRAINT "metrics_metadata_scenario_slug_fkey";

-- DropForeignKey
ALTER TABLE "scenario_metrics" DROP CONSTRAINT "scenario_metrics_scenario_slug_fkey";

-- DropForeignKey
ALTER TABLE "scenario_metrics_total" DROP CONSTRAINT "scenario_metrics_total_scenario_slug_fkey";

-- AlterTable
ALTER TABLE "scenario" DROP CONSTRAINT "scenario_pkey",
ADD CONSTRAINT "scenario_pkey" PRIMARY KEY ("study_slug", "slug");

-- CreateTable
CREATE TABLE "theme_scenario" (
    "id" SERIAL NOT NULL,
    "study_slug" TEXT NOT NULL,
    "theme_slug" TEXT NOT NULL,
    "scenario_slug" TEXT NOT NULL,

    CONSTRAINT "theme_scenario_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "theme_scenario" ADD CONSTRAINT "theme_scenario_study_slug_fkey" FOREIGN KEY ("study_slug") REFERENCES "study"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theme_scenario" ADD CONSTRAINT "theme_scenario_study_slug_theme_slug_fkey" FOREIGN KEY ("study_slug", "theme_slug") REFERENCES "theme"("study_slug", "slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theme_scenario" ADD CONSTRAINT "theme_scenario_study_slug_scenario_slug_fkey" FOREIGN KEY ("study_slug", "scenario_slug") REFERENCES "scenario"("study_slug", "slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics_metadata" ADD CONSTRAINT "metrics_metadata_study_slug_theme_slug_fkey" FOREIGN KEY ("study_slug", "theme_slug") REFERENCES "theme"("study_slug", "slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics_metadata" ADD CONSTRAINT "metrics_metadata_study_slug_scenario_slug_fkey" FOREIGN KEY ("study_slug", "scenario_slug") REFERENCES "scenario"("study_slug", "slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_metrics" ADD CONSTRAINT "scenario_metrics_study_slug_scenario_slug_fkey" FOREIGN KEY ("study_slug", "scenario_slug") REFERENCES "scenario"("study_slug", "slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_metrics_total" ADD CONSTRAINT "scenario_metrics_total_study_slug_scenario_slug_fkey" FOREIGN KEY ("study_slug", "scenario_slug") REFERENCES "scenario"("study_slug", "slug") ON DELETE RESTRICT ON UPDATE CASCADE;
