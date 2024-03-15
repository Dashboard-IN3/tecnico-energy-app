import {
  metrics,
  metrics_metadata,
  scenario,
  study_scale,
  Prisma,
} from "@prisma/client"
import fs from "fs/promises"
import xlsx from "xlsx"
import { slugify } from "./slugify"

export class Workbook {
  readonly WORKSHEET_NAMES = {
    metadata: "study",
    metrics: "metrics",
    metricsMetadata: "metrics_metadata",
    scenariosMetadata: "scenarios_metadata",
  }

  readonly BASELINE_SCENARIO = "Baseline"

  constructor(private workbook: xlsx.WorkBook) {}

  private fetchSheet(name: string): xlsx.WorkSheet {
    if (!this.workbook.SheetNames.includes(name)) {
      throw new Error(`${name} is not a valid sheet of workbook.`)
    }
    return this.workbook.Sheets[name]
  }

  private loadSheetAsJson<T extends Record<string, any>>(name: string): T[] {
    return xlsx.utils.sheet_to_json<T>(this.fetchSheet(name)).map(
      row =>
        Object.fromEntries(
          Object.entries(row)
            // Sanitize column names by converting to lowercase, replacing spaces with
            // underscores, and removing asterisks
            .map(([k, v]) => [this.processColumnName(k), v])
            // Ignore columns with "ignore" in the name
            .filter(([k, v]: [string, unknown]) => !k.includes("ignore"))
        ) as T
    )
  }

  /**
   * Return the sheet as an array of key-value pairs, useful for sheets where the first
   * column is the key and the second column is the value. This pattern is typically
   * used when the sheet represents a single record.
   *
   * @param name Sheet name
   * @returns Array of key-value pairs
   */
  private loadSheetAsTuple(name: string): [string, string][] {
    return xlsx.utils
      .sheet_to_json<[string, string]>(this.fetchSheet(name), {
        header: 1,
      })
      .map(([k, v]) => [this.processColumnName(k), v])
  }

  /**
   * Initialize a workbook from a file path.
   * @param path Path to spreadsheet file
   * @returns A promise that resolves to a workbook
   */
  public static async load(path: string): Promise<Workbook> {
    const data = await fs.readFile(path)
    return new Workbook(xlsx.read(data))
  }

  /**
   * Retrieve study metadtata from the workbook.
   * @returns
   */
  public loadMetadata(): StudyMetadataInput {
    const keyVals = this.loadSheetAsTuple(this.WORKSHEET_NAMES.metadata).map(
      ([k, v]) => [
        k,
        // metrics_key_field value should be normalized
        k === "metrics_key_field" ? v.toLowerCase() : v,
      ]
    )
    return Object.fromEntries(keyVals) as any as StudyMetadataInput
  }

  public loadMetrics(): Omit<metrics, "study_slug">[] {
    return this.loadSheetAsJson<MetricsInput>(this.WORKSHEET_NAMES.metrics)
  }

  public loadScenariosMetadata(): Omit<scenario, "study_slug">[] {
    return (
      this.loadSheetAsJson<ScenariosMetadataInput>(
        this.WORKSHEET_NAMES.scenariosMetadata
      )
        // Remove baseline scenario
        .filter(({ scenario }) => !this.isBaselineScenario(scenario))
        .map(({ scenario, description }) => ({
          name: scenario,
          slug: slugify(scenario),
          description,
          methodology: null,
        }))
    )
  }

  public loadMetricsMetadata(): Omit<metrics_metadata, "study_slug">[] {
    return this.loadSheetAsJson<MetricsMetadataInput>(
      this.WORKSHEET_NAMES.metricsMetadata
    ).map(({ theme: theme_slug, scenario, ...data }) => {
      for (const key of ["category", "usage", "source"]) {
        data[key] = data[key]?.toLowerCase().replaceAll("all", "") || undefined
      }
      return {
        theme_slug,
        scenario_slug: this.isBaselineScenario(scenario)
          ? null
          : slugify(scenario),
        ...this.trimExtraCols(data, Prisma.Metrics_metadataScalarFieldEnum),
      }
    })
  }

  private processColumnName(name: string): string {
    return name.toLowerCase().replaceAll(" ", "_").replaceAll("*", "")
  }

  /**
   * Removes unused columns from an object based on a given schema.
   * @param obj The object to remove unused columns from.
   * @param schema The schema defining the columns to keep.
   * @returns The object with unused columns removed.
   */
  private trimExtraCols<T extends object, S extends object>(
    obj: T,
    schema: S
  ): T {
    return Object.fromEntries(
      Object.entries(obj).filter(([k, v]) => Object.keys(schema).includes(k))
    ) as T
  }

  /**
   * Convert baseline scenario to undefined. It is critical for the baseline scenarios
   * to be undefined in the database for the rank() operation performed within database
   * functions when merging scenario data with baseline data.
   * @param scenario - The scenario to be processed.
   * @returns The processed scenario value.
   */
  private isBaselineScenario(scenario: string) {
    return scenario.toLowerCase() === this.BASELINE_SCENARIO.toLocaleLowerCase()
  }
}

interface StudyMetadataInput {
  name: string
  description: string
  details?: string
  image?: string
  scale: study_scale
  highlights: string
  geom_key_field: string
  metrics_key_field: string
}

interface MetricsInput extends Omit<metrics, "study_slug"> {}

interface MetricsMetadataInput
  extends Omit<
    metrics_metadata,
    "study_slug" | "theme_slug" | "scenario_slug"
  > {
  theme: string
  scenario: string
}

interface ScenariosMetadataInput {
  scenario: string
  description: string
}
