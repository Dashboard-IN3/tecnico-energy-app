import { metrics_metadata } from "@prisma/client"
import { isEqual } from "lodash-es"

export const getMetricsOptions = ({ metadata, category, usage, source }) => {
  let filteredMetadata = metadata
  if (category || usage || source) {
    if (category) {
      filteredMetadata = filteredMetadata.filter(
        option => option.category === category
      )
    }
    if (usage) {
      filteredMetadata = filteredMetadata.filter(
        option => option.usage === usage
      )
    }
    if (source) {
      filteredMetadata = filteredMetadata.filter(
        option => option.source === source
      )
    }
  }
  const metricsOptions = filteredMetadata.reduce(
    (acc, metrics) => {
      const { category, source, usage } = metrics
      if (category) {
        acc.categories.add(category)
      }
      if (usage) {
        acc.usages.add(usage)
      }
      if (source) {
        acc.sources.add(source)
      }
      return acc
    },
    {
      categories: new Set(),
      sources: new Set(),
      usages: new Set(),
    }
  )
  metricsOptions.categories = [...metricsOptions.categories].map(option => ({
    value: option,
    label: option,
  }))
  metricsOptions.usages = [...metricsOptions.usages].map(option => ({
    value: option,
    label: option,
  }))
  metricsOptions.sources = [...metricsOptions.sources].map(option => ({
    value: option,
    label: option,
  }))
  return metricsOptions
}

export const getUniqueMetricsCombinations = (
  metricsMetadata: metrics_metadata[]
) => {
  const studyMetadata = Object.values(metricsMetadata).reduce((acc, obj) => {
    const { theme_slug, scenario_slug, category, source, usage } = obj

    // Check if the theme_slug already exists in the accumulator, if not, initialize it with an empty object
    if (!acc[theme_slug]) {
      acc[theme_slug] = {}
    }

    const scenarioKey = scenario_slug || "baseline"

    // Check if the scenario exists in the theme object, if not, initialize it with empty arrays
    if (!acc[theme_slug][scenarioKey]) {
      acc[theme_slug][scenarioKey] = {
        combinations: [],
      }
    }

    // Add combination of category, source, and usage to the combinations array
    const combination = { category, source, usage }
    if (
      !acc[theme_slug][scenarioKey].combinations.some(item =>
        isEqual(item, combination)
      )
    ) {
      acc[theme_slug][scenarioKey].combinations.push(combination)
    }

    return acc
  }, {})

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
