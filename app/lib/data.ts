import { cache } from "react"
import prisma from "@/lib/prisma"

export const getStudies = cache(prisma.study.findMany)
export const getStudy = cache((slug: string) =>
  prisma.study.findUnique({
    where: { slug },
    include: { themes: { include: { scenarios: true } } },
  })
)
