import prisma from "../lib/prisma"

async function main() {
  const studies = [
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

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
