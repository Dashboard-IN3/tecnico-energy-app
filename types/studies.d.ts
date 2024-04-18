declare namespace Studies {
  export type Study = {
    themes: { [themeId: string]: Theme }
    slug: string
    name: string
    description: string
    image_src?: string | null
    selectedTheme: Theme
    selectedThemeId: string
    summary: {
      totalSelectedFeatures: number
      summaryUnit: string
      summaryTotal: number
      summaryAvg: number
    }
    isDrawing: boolean
    aoi: MapState.aoi
    metadata: Metadata
    scale: "Building" | "Municipality" | null
  }

  export type Metadata = {
    [theme_slug: string]: {
      categories: string[]
      sources: string[]
      usages: string[]
    }
  }

  export type Theme = {
    name: string
    slug: string
    scenarios: { [scenario_id]: Scenario }
    selectedScenario: Scenario
  }

  export type Scenario = {
    slug: string
    description: string | null
    name: string
    selectedUsage: { value: string; label: string } | null
    selectedCategory: { value: string; label: string } | null
    selectedSource: { value: string; label: string } | null
  }
}
