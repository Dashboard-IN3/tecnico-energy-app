import fs from "fs/promises"
import path from "path"
import prisma from "../lib/prisma"
import { Workbook } from "./utils/Workbook"
import { Prisma, PrismaClient, metrics } from "@prisma/client"
import { DefaultArgs } from "@prisma/client/runtime/library"
import { Dirent } from "fs"

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
            log(`no existing study found: ${study_slug}`)
            break
          default:
            throw e
        }
      }

      const studyResult = await tx.study.create({
        data: { ...workbook.loadMetadata(), slug: study_slug },
      })
      log(`created study record: ${studyResult.slug}`)

      const metricsResult = await tx.metrics.createMany({
        data: workbook
          .loadMetrics()
          .map((m): metrics => ({ ...m, study_slug })),
        skipDuplicates: true,
      })
      log(`ingested ${metricsResult.count} metrics records`)

      const scenarioResult = await tx.scenario.createMany({
        data: workbook
          .loadScenariosMetadata()
          .map(scenario => ({ ...scenario, study_slug })),
        skipDuplicates: true,
      })
      log(`ingested ${scenarioResult.count} scenario metadata records`)

      const metricsMetadataResult = await tx.metrics_metadata.createMany({
        data: workbook.loadMetricsMetadata().map(m => ({ ...m, study_slug })),
        skipDuplicates: true,
      })
      log(`ingested ${metricsMetadataResult.count} metrics metadata records`)
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
