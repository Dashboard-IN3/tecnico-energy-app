import fs from "fs/promises"
import path from "path"
import zlib from "zlib"
import { promisify } from "util"
import prisma from "../lib/prisma"
import { Workbook } from "./utils/Workbook"
import { metrics, Prisma } from "@prisma/client"
import { getChecksum } from "./utils/checksum"

const gunzip = promisify(zlib.gunzip)

const STRICT_MODE = process.env.STRICT

const successes: string[] = []
const failures: Array<[string, Error]> = []

async function main() {
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

    const checksums = {
      study_slug,
      metrics: await getChecksum(worksheetPath),
      geo: await getChecksum(geojsonPath),
    }

    if (
      await prisma.file_checksum.count({
        where: checksums,
      })
    ) {
      log(`Study unchanged from last ingestion. Skipping.`)
      continue
    }

    try {
      await prisma.$transaction(
        async tx => {
          // Update checksums
          await tx.file_checksum.upsert({
            create: checksums,
            update: checksums,
            where: { study_slug },
          })

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
          const metrics = workbook.loadMetrics().map((data): metrics => {
            for (const [k, v] of Object.entries(data)) {
              if (k === study.metrics_key_field) continue
              if (["", undefined, null].includes(v as any)) {
                throw new Error(
                  `values for metrics sheet cannot be empty. Missing value for ${{
                    study_slug,
                    k,
                    v,
                  }}`
                )
              }
            }
            return {
              study_slug,
              geometry_key: String(data[study.metrics_key_field]),
              data,
            }
          })
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
          log(`decompressing ${geojsonPath}...`)
          const geoJsonStr = await gunzip(compressedData)
          log(`parsing ${geojsonPath}...`)
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

          await tx.$executeRaw`
            CREATE TEMPORARY TABLE tmp_geometries (
              key text,
              geom geometry,
              properties json
            ) ON COMMIT DROP
          `
          await tx.$executeRaw`CREATE INDEX ON tmp_geometries (key)`

          const totalGeometries = await tx.$executeRaw(Prisma.sql`
            INSERT INTO tmp_geometries (key, geom, properties) VALUES ${Prisma.join(
              geoJSON.features.map(f => {
                const geomKey = f.properties[studyResult.geom_key_field]
                const geomStr = JSON.stringify(f.geometry)
                const props = JSON.stringify(f.properties)
                return Prisma.sql`(${geomKey}, ST_GeomFromGeoJSON(${geomStr}), ${props}::json)`
              })
            )}
          `)
          log(`inserted ${totalGeometries} geometries into a temporary table`)

          const retainedGeometries = await tx.$executeRaw`
            INSERT INTO geometries (key, study_slug, geom, properties)
            SELECT t.key, m.study_slug, t.geom, t.properties
            FROM tmp_geometries t, metrics m
            WHERE t.key = m.geometry_key
            AND m.study_slug = ${study_slug}
            ON CONFLICT (study_slug, key) DO NOTHING
          `
          log(
            `copied ${retainedGeometries} geometries into to the permanent table`
          )

          if (retainedGeometries !== totalGeometries) {
            log(`retrieving geometries that were not retained...`)
            const ignoredGeometries = await tx.$queryRaw<
              { key: string; most_similar_key: string }[]
            >`
              SELECT t.key, (
                SELECT m.geometry_key
                FROM metrics m
                WHERE m.study_slug = ${study_slug}
                ORDER BY similarity(m.geometry_key, t.key) DESC
                LIMIT 1
              ) AS most_similar_key
              FROM tmp_geometries t
              LEFT OUTER JOIN metrics m ON t.key = m.geometry_key AND m.study_slug = ${study_slug}
              WHERE m.geometry_key IS NULL;
            `

            ignoredGeometries.forEach(({ key, most_similar_key }) => {
              log(
                key === most_similar_key
                  ? `ignoring geometry with key "${key}", a geometry with that key already exists in the geometry table`
                  : `ignoring geometry with key "${key}", no related metrics in metrics table (closest metric had geometry_key="${most_similar_key}")`
              )
            })
          }

          log(`checking for any metrics without corresponding geometries...`)
          const results = await tx.$queryRaw<{ geometry_key: string }[]>`
            SELECT m.geometry_key
            FROM metrics m 
            LEFT OUTER JOIN geometries g ON m.study_slug = g.study_slug AND m.geometry_key = g.key 
            WHERE g.key IS NULL AND m.study_slug = ${study_slug}
          `
          if (results.length) {
            const missingGeometries = results.map(r => r.geometry_key).sort()
            if (STRICT_MODE) {
              throw new Error(
                `${results.length} metrics are missing corresponding geometries. ` +
                  `Failing due to STRICT_MODE=true.`,
                { cause: missingGeometries }
              )
            }
            const r = await tx.metrics.deleteMany({
              where: { geometry_key: { in: missingGeometries }, study_slug },
            })
            log(
              `deleted ${r.count} metrics due to missing corresponding geometries. ` +
                `These are the "geometry_key" values of those metrics: ` +
                JSON.stringify(missingGeometries)
            )
          } else {
            log(`no metrics are missing corresponding geometries`)
          }

          /**
           * Pre-process derived data
           */

          // Create spatial summary
          log(`deriving spatial summary for ${study_slug}...`)
          await tx.$executeRaw`
            WITH summary AS (
              SELECT
                  ST_Extent(geom) AS bbox,
                  ST_Centroid(ST_Extent(geom)) AS centroid
              FROM
                  geometries
              WHERE
                  study_slug = ${study_slug}
            ),
            coordinates AS (
                SELECT
                    ARRAY[ST_XMin(bbox), ST_YMin(bbox), ST_XMax(bbox), ST_YMax(bbox)] AS bbox_array,
                    ARRAY[ST_X(centroid), ST_Y(centroid)] AS centroid_array
                FROM
                    summary
            )
            UPDATE
                study
            SET
                centroid_coordinates = c.centroid_array,
                bbox = c.bbox_array
            FROM
                coordinates c;
            `

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

          successes.push(study_slug)
        },
        {
          maxWait: 1 * 60 * 1000, // Query Timeout
          timeout: 10 * 60 * 1000, // Each Ingestion Timeout
        }
      )
    } catch (e) {
      log(
        `failure encountered during ingestion of study "${study_slug}". Stopping.`
      )
      failures.push([study_slug, e])
    }
  }
}

main()
  .catch(e =>
    console.error(
      `An uncaught error occurred during ingestion: ${indent(e.message)}`
    )
  )
  .finally(async () => {
    await prisma.$disconnect()

    console.log(
      `\n***** Successfully ingested ${successes.length} studies: *****`
    )
    successes.forEach(study_slug => console.log(`- Study: ${study_slug}`))

    if (failures.length) {
      console.log(`\n***** Failed to ingest ${failures.length} studies: *****`)
      failures.forEach(([study_slug, error]) => {
        console.log(`- Study: ${study_slug}`)
        console.log("  Error Cause: " + indent(`${error.cause}`))
        console.log("  Error Stack: " + indent(`${error.stack}`) + "\n")
      })
    }
    process.exit(failures.length)
  })

function indent(str: string, spaces: number = 4, skipFirst: boolean = true) {
  return str
    .split("\n")
    .map((line, i) => (i === 0 && skipFirst ? line : " ".repeat(spaces) + line))
    .join("\n")
    .trim()
}
