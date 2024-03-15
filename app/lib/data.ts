import { cache } from "react"
import prisma from "@/lib/prisma"
import { study, theme } from "@prisma/client"

export const getStudies: () => Promise<study[]> = cache(prisma.study.findMany)

export const getStudy = cache(
  (slug: string): Promise<null | (study & { themes: theme[] })> =>
    prisma.study.findUnique({
      where: { slug },
      include: { themes: true },
    })
)
