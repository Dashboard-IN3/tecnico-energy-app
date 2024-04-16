-- DropIndex
DROP INDEX "metrics_study_slug_geometry_key_key";

-- CreateTable
CREATE TABLE "scenario_metrics" (
    "id" SERIAL NOT NULL,
    "study_slug" TEXT NOT NULL,
    "scenario_slug" TEXT,
    "geometry_key" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "scenario_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario_metrics_total" (
    "id" SERIAL NOT NULL,
    "study_slug" TEXT NOT NULL,
    "scenario_slug" TEXT,
    "data" JSONB NOT NULL,

    CONSTRAINT "scenario_metrics_total_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scenario_metrics_study_slug_idx" ON "scenario_metrics"("study_slug");

-- CreateIndex
CREATE INDEX "scenario_metrics_scenario_slug_idx" ON "scenario_metrics"("scenario_slug");

-- CreateIndex
CREATE INDEX "scenario_metrics_total_study_slug_idx" ON "scenario_metrics_total"("study_slug");

-- CreateIndex
CREATE INDEX "scenario_metrics_total_scenario_slug_idx" ON "scenario_metrics_total"("scenario_slug");

-- AddForeignKey
ALTER TABLE "scenario_metrics" ADD CONSTRAINT "scenario_metrics_study_slug_fkey" FOREIGN KEY ("study_slug") REFERENCES "study"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_metrics" ADD CONSTRAINT "scenario_metrics_scenario_slug_fkey" FOREIGN KEY ("scenario_slug") REFERENCES "scenario"("slug") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_metrics_total" ADD CONSTRAINT "scenario_metrics_total_study_slug_fkey" FOREIGN KEY ("study_slug") REFERENCES "study"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_metrics_total" ADD CONSTRAINT "scenario_metrics_total_scenario_slug_fkey" FOREIGN KEY ("scenario_slug") REFERENCES "scenario"("slug") ON DELETE SET NULL ON UPDATE CASCADE;
