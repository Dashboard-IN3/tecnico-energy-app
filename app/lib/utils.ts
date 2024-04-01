import { metrics_metadata } from "@prisma/client"

export const getStudyMetadata = (metricsMetadata: metrics_metadata[]) => {
  const studyMetadata = Object.values(metricsMetadata).reduce(
    (acc, metrics) => {
      const { theme_slug, category, source, usage } = metrics
      // initialize sets by theme in accumulator
      if (!acc[theme_slug]) {
        acc[theme_slug] = {
          categories: new Set(),
          sources: new Set(),
          usages: new Set(),
        }
      }

      // Add category, source, and usage to the respective sets
      acc[theme_slug].categories.add(category)
      acc[theme_slug].sources.add(source)
      acc[theme_slug].usages.add(usage)

      return acc
    },
    {}
  )

  // Convert sets to arrays if needed
  Object.keys(studyMetadata).forEach(theme => {
    studyMetadata[theme].categories = [...studyMetadata[theme].categories]
    studyMetadata[theme].sources = [...studyMetadata[theme].sources]
    studyMetadata[theme].usages = [...studyMetadata[theme].usages]
  })

  return studyMetadata
}
