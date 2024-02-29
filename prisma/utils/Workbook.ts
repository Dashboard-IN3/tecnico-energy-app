import {
  metrics,
  metrics_metadata,
  scenario,
  study_scale,
} from "@prisma/client"
import { Metric } from "@prisma/client/runtime"
import fs from "fs/promises"
import xlsx from "xlsx"

export class Workbook {
  readonly WORKSHEET_NAMES = {
    metadata: "study",
    metrics: "metrics",
    metricsMetadata: "metrics_metadata",
    scenariosMetadata: "scenarios_metadata",
  }
  constructor(private workbook: xlsx.WorkBook) {}

  private fetchSheet(name: string): xlsx.WorkSheet {
    if (!this.workbook.SheetNames.includes(name)) {
      throw new Error(`${name} is not a valid sheet of workbook.`)
    }
    return this.workbook.Sheets[name]
  }

  private loadSheetAsJson<T>(name: string): T[] {
    return xlsx.utils.sheet_to_json<T>(this.fetchSheet(name)).map(
      row =>
        Object.fromEntries(
          Object.entries(row)
            // Sanitize column names by converting to lowercase, replacing spaces with
            // underscores, and removing asterisks
            .map(([k, v]) => [
              k.toLowerCase().replace(" ", "_").replace("*", ""),
              v,
            ])
            // Ignore columns with "ignore" in the name
            .filter(([k, v]) => !k.includes("ignore"))
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
      .filter(([k, v]) => k && v)
      .map(([k, v]) => [k.toLowerCase().replace(" ", "_").replace("*", ""), v])
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
    const keyVals = this.loadSheetAsTuple(this.WORKSHEET_NAMES.metadata)
    return Object.fromEntries(keyVals) as any as StudyMetadataInput
  }

  public loadMetrics(): Omit<metrics, "study_slug">[] {
    const metrics = this.loadSheetAsJson<Record<string, any>>(
      this.WORKSHEET_NAMES.metrics
    )
    const firstKey = Object.keys(metrics[0])[0]
    return metrics.map(({ [firstKey]: geometry_key, ...data }) => ({
      geometry_key: `${geometry_key}`,
      data,
    }))
  }

  public loadMetricsMetadata(): Omit<metrics_metadata, "study_slug">[] {
    return this.loadSheetAsJson<MetricsMetadataInput>(
      this.WORKSHEET_NAMES.metricsMetadata
    ).map(({ theme: theme_slug, scenario, ...data }) => ({
      theme_slug,
      scenario_slug: slugify(scenario),
      ...data,
    }))
  }

  public loadScenariosMetadata(): Omit<scenario, "study_slug">[] {
    return this.loadSheetAsJson<ScenariosMetadataInput>(
      this.WORKSHEET_NAMES.scenariosMetadata
    ).map(({ scenario: name, description }) => ({
      name,
      slug: slugify(name),
      description,
      methodology: null,
    }))
  }
}

interface StudyMetadataInput {
  name: string
  description: string
  details?: string
  image?: string
  scale: study_scale
}

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
}
