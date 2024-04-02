import { metrics_metadata } from "@prisma/client"

export const getStudyMetadata = (metricsMetadata: metrics_metadata[]) => {
  const studyMetadata = Object.values(metricsMetadata).reduce((acc, obj) => {
    const { theme_slug, scenario_slug, category, source, usage } = obj

    // Check if the theme_slug already exists in the accumulator, if not, initialize it with an empty object
    if (!acc[theme_slug]) {
      acc[theme_slug] = {}
    }

    const scenarioKey = scenario_slug || "all"

    // Check if the scenario exists in the theme object, if not, initialize it with empty sets
    if (!acc[theme_slug][scenarioKey]) {
      acc[theme_slug][scenarioKey] = {
        categories: new Set(),
        sources: new Set(),
        usages: new Set(),
      }
    }

    // Add category, source, and usage to the respective sets
    acc[theme_slug][scenarioKey].categories.add(category)
    acc[theme_slug][scenarioKey].sources.add(source)
    acc[theme_slug][scenarioKey].usages.add(usage)

    return acc
  }, {})

  // Convert sets to arrays
  Object.keys(studyMetadata).forEach(theme => {
    Object.keys(studyMetadata[theme]).forEach(scenario => {
      studyMetadata[theme][scenario].categories = [
        ...studyMetadata[theme][scenario].categories,
      ]
      studyMetadata[theme][scenario].sources = [
        ...studyMetadata[theme][scenario].sources,
      ]
      studyMetadata[theme][scenario].usages = [
        ...studyMetadata[theme][scenario].usages,
      ]
    })
  })

  return studyMetadata
}

export const baselineScenario = {
  slug: "baseline",
  description: "Baseline Scenario",
  name: "Baseline",
  selectedCategory: null,
  selectedSource: null,
  selectedUsage: null,
}
