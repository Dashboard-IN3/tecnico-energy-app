import { metrics_metadata } from "@prisma/client"
import { isEqual } from "lodash-es"

export const getMetricsOptions = ({
  metadata,
  selectedCategory,
  selectedUsage,
  selectedSource,
}) => {
  const metricsOptions = metadata.reduce(
    (acc, metrics) => {
      const { category, source, usage } = metrics
      if (category) {
        acc.categories.add(category)
      }
      // limit usage and source options to selected category
      if (!category || category === selectedCategory.value) {
        // limit usage to selected source
        if (
          !selectedSource ||
          selectedSource.value === "ALL" ||
          selectedSource.value === source
        ) {
          usage ? acc.usages.add(usage) : acc.usages.add("ALL")
        }
        // limit source options to category and usage
        if (
          !selectedUsage ||
          selectedUsage.value == "ALL" ||
          selectedUsage.value === usage
        ) {
          source ? acc.sources.add(source) : acc.sources.add("ALL")
        }
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
    label: option === "ALL" ? "All" : option,
  }))
  metricsOptions.usages = [...metricsOptions.usages].map(option => ({
    value: option,
    label: option === "ALL" ? "All" : option,
  }))
  metricsOptions.sources = [...metricsOptions.sources].map(option => ({
    value: option,
    label: option === "ALL" ? "All" : option,
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
