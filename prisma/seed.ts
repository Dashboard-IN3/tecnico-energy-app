import fs from "fs/promises"
import prisma from "../lib/prisma"
import { Workbook } from "./utils/Workbook"

import { metrics } from "@prisma/client"

/**
 * TODO: Run each file ingestion as a single transaction, first clearing out any existing data matching the study slug
 */

async function main() {
  const files = await fs.readdir("data", { withFileTypes: true })
  for (const file of files) {
    if (!file.isFile || !file.name.endsWith(".xlsx")) continue

    const fullPath = `${file.path}/${file.name}`
    console.log(`\n${fullPath}`)
    const workbook = await Workbook.load(fullPath)

    const metadata = {
      slug: file.name.split(".")[0],
      ...workbook.loadMetadata(),
    }

    const studyResult = await prisma.study.upsert({
      where: { slug: metadata.slug },
      update: metadata,
      create: metadata,
    })
    console.log(`... created study record: ${studyResult.slug}`)

    const metricsResult = await prisma.metrics.createMany({
      data: workbook
        .loadMetrics()
        .map((m): metrics => ({ ...m, study_slug: metadata.slug })),
      skipDuplicates: true,
    })
    console.log(`... ingested ${metricsResult.count} new metrics records`)

    const scenarioResult = await prisma.scenario.createMany({
      data: workbook.loadScenariosMetadata().map(scenario => ({
        ...scenario,
        study_slug: metadata.slug,
      })),
      skipDuplicates: true,
    })
    console.log(
      `... ingested ${scenarioResult.count} new scenario metadata records`
    )

    const metricsMetadataResult = await prisma.metrics_metadata.createMany({
      data: workbook
        .loadMetricsMetadata()
        .map(m => ({ ...m, study_slug: metadata.slug })),
      skipDuplicates: true,
    })
    console.log(
      `... ingested ${metricsMetadataResult.count} new metrics metadata records`
    )
  }
}

let exitCode = 0
main()
  .catch(e => {
    console.log(e)
    exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
    process.exit(exitCode)
  })
