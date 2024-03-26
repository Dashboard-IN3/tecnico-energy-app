import prisma from "../lib/prisma"
import { study_scale } from "@prisma/client"

async function main() {
  const studies = [
    {
      name: "Portugal Municipal Energy",
      scale: study_scale["Municipality"],
    },
    {
      name: "Lisbon Building Energy",
      scale: study_scale["Building"],
    },
    {
      name: "FPO",
      scale: study_scale["Building"],
    },
  ].map((study, idx) => ({
    name: study.name,
    slug: study.name.toLowerCase().replaceAll(" ", "-"),
    description: study.name,
    image_src: `https://fakeimg.pl/600x400?text=${study.name}`,
    study_scale: study.scale,
  }))
  for (const study of studies) {
    await prisma.study.upsert({
      where: { slug: study.slug },
      update: study,
      create: study,
    })
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
