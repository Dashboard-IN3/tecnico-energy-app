import { cache } from "react"
import prisma from "@/lib/prisma"
import { study } from "@prisma/client"

export const getStudies: () => Promise<study[]> = cache(prisma.study.findMany)

export const getStudy = cache((slug: string) =>
  prisma.study.findUnique({
    where: { slug },
    include: {
      themes: {
        include: { scenarios: { include: { scenario: true } } },
      },
    },
  })
)
