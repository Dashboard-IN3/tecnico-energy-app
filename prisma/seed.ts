import fs from "fs/promises"
import prisma from "../lib/prisma"
import { Workbook } from "./utils/Workbook"

interface InputMetadata {
  "Column name_2": string
  "Column name original": string
  Description: string
  Units: string
  Theme: string
  Usage: string
  Source: string
  Type: string
  Scenario: string
}

async function main() {
  const files = await fs.readdir("data", { withFileTypes: true })
  for (const file of files) {
    if (!file.isFile || !file.name.endsWith(".xlsx")) continue
    const fullPath = `${file.path}/${file.name}`
    console.log(`Processing ${fullPath}...`)
    const workbook = await Workbook.load(fullPath)
    const metadata = {
      slug: file.name,
      ...workbook.loadMetadata(),
    }

    console.log({ metadata })

    await prisma.study.upsert({
      where: { slug: file.name },
      update: metadata,
      create: metadata,
    })
  }
  // const studies = Array.from(new Set(metadata.map(r => r["Theme"]))) // NOTE: labelled as "Theme" but actually represents study

  // for (const name of studies) {
  //   const slug = name.toLowerCase().replace(" ", "-")
  //   const studyInput: Prisma.studyCreateInput = {
  //     name,
  //     slug,
  //     study_type: "Municipality",
  //   }
  //   await prisma.study.upsert({
  //     where: { slug: studyInput.slug },
  //     update: studyInput,
  //     create: studyInput,
  //   })
  //   console.log(`... created study: ${slug}`)
  // }
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
