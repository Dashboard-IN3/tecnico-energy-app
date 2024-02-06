import { Prisma } from "@prisma/client"
import prisma from "../lib/prisma"
import yaml from "js-yaml"
import fs from "fs/promises"

async function main() {
  const files = await fs.readdir("./data", {})
  for (const file of files) {
    const data = yaml.load(file)
    console.log(data)
    const studies: Prisma.StudyCreateInput[] = [
      "Portugal Municipal Energy",
      "Lisbon Building Energy",
      "FPO",
    ].map((name, idx) => ({
      name,
      slug: name.toLowerCase().replaceAll(" ", "-"),
      description: name,
      imageSrc: `https://fakeimg.pl/600x400?text=${name}`,
    }))

    for (const study of studies) {
      await prisma.study.upsert({
        where: { slug: study.slug },
        update: study,
        create: study,
      })
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
