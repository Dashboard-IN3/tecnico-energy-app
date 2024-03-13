import fs from "fs/promises"
import path from "path"
import prisma from "../lib/prisma"
import { Workbook } from "./utils/Workbook"
import { metrics } from "@prisma/client"
import { slugify } from "./utils/slugify"

/**
 * TODO: Run each file ingestion as a single transaction, first clearing out any existing data matching the study slug
 */

async function main() {
  const files = await fs.readdir("data", { withFileTypes: true })
  for (const file of files) {
    const log = msg =>
      console.log(`${new Date().toISOString()} | ${file.name} | ${msg}`)

    const filename = path.parse(file.name)

    if (!file.isFile || filename.ext !== ".xlsx") {
      log("Ignoring.")
      continue
    }

    const worksheetPath = `${file.path}/${file.name}`
    const geojsonPath = `${file.path}/${filename.name}.geojson`

    await prisma.$transaction(async tx => {
      const workbook = await Workbook.load(worksheetPath)

      const study_slug = filename.name

      try {
        await tx.study.delete({ where: { slug: study_slug } })
        log(`deleted existing study record: ${study_slug}`)
      } catch (e) {
        switch (e.code) {
          case "P2025":
            log(`no existing study found, nothing to delete: ${study_slug}`)
            break
          default:
            throw e
        }
      }

      const study = { ...workbook.loadMetadata(), slug: study_slug }
      const studyResult = await tx.study.create({
        data: study,
      })
      log(`created study record: ${studyResult.slug}`)

      const metrics = workbook
        .loadMetrics()
        .map((m): metrics => ({ ...m, study_slug }))
      const metricsResult = await tx.metrics.createMany({
        data: metrics,
        skipDuplicates: true,
      })
      log(`ingested ${metricsResult.count} metrics records`)

      const scenarios = workbook
        .loadScenariosMetadata()
        .map(scenario => ({ ...scenario, study_slug }))
      const scenarioResult = await tx.scenario.createMany({
        data: scenarios,
        skipDuplicates: true,
      })
      log(`ingested ${scenarioResult.count} scenario metadata records`)

      const metricsMetadata = workbook
        .loadMetricsMetadata()
        .filter(m => {
          if (scenarios.map(s => s.slug).includes(m.scenario_slug)) return true
          log(
            `skipping metrics metadata record for unknown scenario: ${m.scenario_slug}`
          )
        })
        .map(m => ({ ...m, study_slug }))
      const metricsMetadataResult = await tx.metrics_metadata.createMany({
        data: metricsMetadata,
        skipDuplicates: true,
      })
      log(`ingested ${metricsMetadataResult.count} metrics metadata records`)

      const themes = new Set(metricsMetadata.map(m => m.theme_slug))
      const themesResult = await tx.theme.createMany({
        data: Array.from(themes).map(name => ({
          name,
          study_slug,
          slug: slugify(name),
        })),
        skipDuplicates: true,
      })
      log(`created ${themesResult.count} themes from metrics metadata`)
    })
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
