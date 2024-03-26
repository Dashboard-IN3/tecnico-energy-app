import prisma from "../lib/prisma"
import { study_scale, study_theme } from "@prisma/client"

async function main() {
  const studies = [
    {
      name: "Portugal Municipal Energy",
      scale: study_scale["Municipality"],
      theme: study_theme["Buildings"],
    },
    {
      name: "Lisbon Building Energy",
      scale: study_scale["Building"],
      theme: study_theme["Buildings"],
    },
    {
      name: "FPO",
      scale: study_scale["Building"],
      theme: study_theme["Buildings"],
    },
  ].map((study, idx) => ({
    name: study.name,
    slug: study.name.toLowerCase().replaceAll(" ", "-"),
    description: study.name,
    image_src: `https://fakeimg.pl/600x400?text=${study.name}`,
    study_scale: study.scale,
    study_theme: study.theme,
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
