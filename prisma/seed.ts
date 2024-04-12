import fs from "fs/promises"
import path from "path"
import zlib from "zlib"
import { promisify } from "util"
import prisma from "../lib/prisma"
import { Workbook } from "./utils/Workbook"
import { metrics, Prisma } from "@prisma/client"

const gunzip = promisify(zlib.gunzip)

const DEBUG_MODE = process.env.DEBUG
const STRICT_MODE = process.env.STRICT

async function main() {
  const failures: Failure[] = []
  const files = await fs.readdir("data", { withFileTypes: true })
  for (const file of files) {
    const log = (msg: string) =>
      console.log(`${new Date().toISOString()} | ${file.name} | ${msg}`)

    const filename = path.parse(file.name)

    if (!file.isFile || filename.ext !== ".xlsx") {
      log("Ignoring.")
      continue
    }

    const study_slug = filename.name
    const worksheetPath = `${file.path}/${file.name}`
    const geojsonPath = `${file.path}/${filename.name}.geojson.gz`

    try {
      await prisma.$transaction(
        async tx => {
          const workbook = await Workbook.load(worksheetPath)

          // Clear existing data for study
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

          /**
           * Ingest new data
           */

          // Create study
          log(`ingesting study metadata: ${study_slug}...`)
          const study = { ...workbook.loadMetadata(), slug: study_slug }
          const studyResult = await tx.study.create({
            data: study,
          })
          log(`created study record: ${studyResult.slug}`)

          // Create metrics
          log(`ingesting metrics for ${study_slug}...`)
          const metrics = workbook.loadMetrics().map(
            (data): metrics => ({
              study_slug,
              geometry_key: String(data[study.metrics_key_field]),
              data,
            })
          )
          const metricsResult = await tx.metrics.createMany({
            data: metrics as Prisma.metricsCreateManyInput[],
            skipDuplicates: true,
          })
          log(`ingested ${metricsResult.count} metrics records`)

          // Create scenarios
          log(`ingesting scenarios for ${study_slug}...`)
          const scenarios = workbook
            .loadScenariosMetadata()
            .map(scenario => ({ ...scenario, study_slug }))
          const scenarioResult = await tx.scenario.createMany({
            data: scenarios,
            skipDuplicates: true,
          })
          log(`ingested ${scenarioResult.count} scenario metadata records`)

          // Create themes
          log(`ingesting themes from for ${study_slug}...`)
          const themes = await workbook
            .loadThemes()
            .map(theme => ({ study_slug, ...theme }))
          const themesResult = await tx.theme.createMany({
            data: themes,
            skipDuplicates: true,
          })
          log(`ingested ${themesResult.count} themes from metrics metadata`)

          // Create metrics metadata
          log(`ingesting metrics metadata for ${study_slug}...`)
          const metricsMetadata = workbook
            .loadMetricsMetadata()
            .filter(m => {
              // Avoid FK integrity issues by ignor metrics metadata records for scenarios
              // that don't exist
              if (scenarios.map(s => s.slug).includes(m.scenario_slug!))
                return true
              // Support baseline scenario
              if (m.scenario_slug === null) return true
              log(
                `skipping metrics metadata record for unknown scenario: ${m.scenario_slug}`
              )
            })
            .map(m => ({ ...m, study_slug }))
          const metricsMetadataResult = await tx.metrics_metadata.createMany({
            data: metricsMetadata,
            skipDuplicates: true,
          })
          log(
            `ingested ${metricsMetadataResult.count} metrics metadata records`
          )

          log(`ingesting theme_scenario records for ${study_slug}...`)
          const themeScenarioResult = await tx.theme_scenario.createMany({
            data: Array.from(
              new Set(
                metricsMetadata
                  .filter(m => m.scenario_slug) // Ignore baseline scenario
                  .map(m => ({
                    study_slug,
                    theme_slug: m.theme_slug,
                    scenario_slug: m.scenario_slug,
                  }))
              )
            ),
            skipDuplicates: true,
          })
          log(`ingested ${themeScenarioResult.count} theme_scenario records`)

          // Insert geometries
          log(`processing geometries for ${study_slug}...`)
          const compressedData = await fs.readFile(geojsonPath)
          const geoJsonStr = await gunzip(compressedData)
          const geoJSON = JSON.parse(geoJsonStr.toString())
          if (
            geoJSON.type !== "FeatureCollection" ||
            !Array.isArray(geoJSON.features)
          ) {
            throw new Error("Invalid GeoJSON FeatureCollection")
          }
          log(
            `ingesting ${geoJSON.features.length} geometries, joining the geometry ` +
              `"${studyResult.geom_key_field}" field to the metrics ` +
              `"${studyResult.metrics_key_field}" field...`
          )
          let success = true
          let insertionCount = 0
          for (const feature of geoJSON.features) {
            const geomKey = feature.properties[studyResult.geom_key_field]
            if (!geomKey)
              throw new Error(
                `Encountered geometry without "${
                  studyResult.geom_key_field
                }" field. Available properties: ${Array.from(
                  Object.keys(feature.properties)
                )}`,
                { cause: feature.properties }
              )
            try {
              await tx.$executeRaw`SAVEPOINT before_geom_insert;`
              await tx.$executeRaw`
                INSERT INTO "geometries" ("study_slug", "key", "geom")
                VALUES (${study_slug}, ${geomKey}, ST_GeomFromGeoJSON(${feature.geometry}))
              `
              insertionCount++
            } catch (e) {
              success = false
              await tx.$executeRaw`ROLLBACK TO SAVEPOINT before_geom_insert`
              switch (e.meta?.code) {
                case "23503": // FK Constraint Violation
                  const [{ geometry_key: closestGeometryKey }] =
                    await tx.$queryRaw<{ geometry_key: string }[]>`
                    select 
                      geometry_key 
                    from 
                      metrics 
                    where 
                      study_slug = ${study_slug} 
                    order by 
                      geometry_key <-> ${geomKey} 
                    limit 1
                  `
                  log(
                    `ignoring geometry with key "${geomKey}", no related metrics in metrics ` +
                      `table (closest metric that we could find was "${closestGeometryKey}")`
                  )
                  if (DEBUG_MODE) log(e.meta.message)
                  continue
                case "23505": // Duplicate record
                  log(
                    `failed to insert geometry with key "${geomKey}", already exists in the geometries table`
                  )
                  if (DEBUG_MODE) log(e.meta.message)
                  continue
                default:
                  throw e
              }
            }
          }
          if (!success && STRICT_MODE)
            throw new Error("failed to insert all geometries")
          log(`ingested ${insertionCount} geometries`)

          log(`verifying that all metrics have corresponding geometries...`)
          const results = await tx.$queryRaw<{ geometry_key: string }[]>`
            SELECT 
              m.geometry_key
            FROM 
              metrics m 
            LEFT OUTER JOIN 
              geometries g 
            ON 
              m.study_slug = ${study_slug}
              AND
              m.study_slug = g.study_slug 
              AND 
              m.geometry_key = g.key 
            WHERE g.key IS NULL;
          `
          if (results.length) {
            const missingGeometries = results.map(r => r.geometry_key).sort()
            if (STRICT_MODE) {
              throw new Error(
                `${results.length} metrics are missing corresponding geometries`,
                { cause: missingGeometries }
              )
            }
            log(
              `ignoring ${results.length} metrics due to missing corresponding geometries ` +
                `(would fail but STRICT_MODE=false). Missing geometries: ${missingGeometries}`
            )
          } else {
            log(`no metrics are missing corresponding geometries`)
          }

          /**
           * Pre-process derived data
           */

          // Create scenario metrics
          log(`deriving pre-aggregated scenario metrics for ${study_slug}...`)
          const scenarioMetricsCount = await tx.$executeRaw`
            INSERT INTO scenario_metrics(study_slug, scenario_slug, geometry_key, data)
            SELECT ${study_slug} as study_slug, s.*
            FROM theme t, get_data_for_scenarios(${study_slug}::text, t.slug::text) s
            WHERE t.study_slug = ${study_slug};
          `
          log(`derived ${scenarioMetricsCount} pre-aggregated scenario metrics`)

          // Create scenario metrics totals
          log(
            `deriving pre-aggregated scenario metrics totals for ${study_slug}...`
          )
          const scenarioMetricsTotalsCount = await tx.$executeRaw`
            INSERT INTO scenario_metrics_total(study_slug, scenario_slug, data)
            SELECT ${study_slug} as study_slug, s.*
            FROM theme t, get_aggregation_for_scenarios(${study_slug}::text, t.slug::text) s
            WHERE t.study_slug = ${study_slug};
          `
          log(
            `derived ${scenarioMetricsTotalsCount} pre-aggregated scenario metrics totals`
          )
        },
        {
          maxWait: 180 * 1000, // Max query time
          timeout: 180 * 1000, // Max time per study
        }
      )
    } catch (e) {
      log(`failure during ingestion of study "${study_slug}": ${e.message}`)
      failures.push([study_slug, e])
    }
  }

  if (failures.length) {
    throw failures
  }
}

let exitCode = 0
main()
  .catch((e: Failure[]) => {
    e.forEach(([study_slug, error]) => {
      console.log(`\nFailed to ingest study "${study_slug}":`)
      console.log(`Name: ${error.name}`)
      console.log(`Message: ${error.message}`)
      console.log(`Cause: ${error.cause}`)
      console.log(`Stack: ${error.stack}`)
    })
    exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
    process.exit(exitCode)
  })

type Failure = [string, Error]
