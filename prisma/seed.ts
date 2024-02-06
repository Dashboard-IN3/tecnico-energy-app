import prisma from "../lib/prisma"

async function main() {
  const studies = [
    "Portugal Municipal Energy",
    "Lisbon Building Energy",
    "FPO",
  ].map((name, idx) => ({
    id: idx + 1,
    name,
    slug: name.toLowerCase().replaceAll(" ", "-"),
    description: name,
    image_src: `https://fakeimg.pl/600x400?text=${name}`,
  }))
  for (const study of studies) {
    await prisma.studies.upsert({
      where: { id: study.id },
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
