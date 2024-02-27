import fs from "fs/promises"
import * as t from "io-ts"
import { PathReporter, failure } from "io-ts/PathReporter"
import { getOrElse } from "fp-ts/lib/Either"
import xlsx from "xlsx"

export class Workbook {
  readonly WORKSHEET_NAMES = {
    metadata: "study",
  }
  constructor(private workbook: xlsx.WorkBook) {}

  private fetchSheet(name: string): xlsx.WorkSheet {
    if (!this.workbook.SheetNames.includes(name)) {
      throw new Error(`${name} is not a valid sheet of workbook.`)
    }
    return this.workbook.Sheets[name]
  }

  private loadSheetAsJson<T>(name: string): T[] {
    return xlsx.utils.sheet_to_json<T>(this.fetchSheet(name))
  }

  private loadSheetAsTuple(name: string): [string, string][] {
    return xlsx.utils
      .sheet_to_json<[string, string]>(this.fetchSheet(name), {
        header: 1,
      })
      .filter(([k, v]) => k && v)
      .map(([k, v]) => [k.toLowerCase().replace(" ", "_"), v])
  }

  public static async load(path: string): Promise<Workbook> {
    const data = await fs.readFile(path)
    return new Workbook(xlsx.read(data))
  }

  public loadMetadata(): StudyInput2["_I"] {
    const sheet = this.loadSheetAsTuple(this.WORKSHEET_NAMES.metadata)
    const data = Object.fromEntries(sheet)
    return validate(StudyInput, data).props
  }
}
const StudyInput = t.type({
  name: t.string,
  description: t.string,
  details: t.union([t.string, t.undefined]), // Optional
  image: t.union([t.string, t.undefined]), // Optional
  scale: t.string,
})

type StudyInput2 = typeof StudyInput

// function validate<T extends t.TypeC<any>>(model: T, jsonData): T {
//   const result = model.decode(jsonData)
//   if (result._tag === "Left") {
//     throw new Error(
//       "Validation error: " + PathReporter.report(result).join(", ")
//     )
//   }
//   return jsonData
// }

function validate<T extends t.TypeC<any>>(model: T, jsonData: any): T {
  const toError = (errors: any) => new Error(failure(errors).join("\n"))
  const employee = getOrElse(toError)(model.decode(jsonData))

  if (employee instanceof Error) {
    throw employee
  }
  return jsonData
}
