declare namespace Studies {
  export type Study = {
    themes: { [themeId: string]: Theme }
    slug: string
    name: string
    description: string
    imageSrc?: string
    selectedTheme: Theme
    selectedThemeId: string
    totalSelectedFeatures: number
    isDrawing: boolean
    aoi: MapState.aoi
    metadata: Metadata
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
    scenarios: Scenario[]
    selectedScenario: Scenario | null
  }

  export type Scenario = {
    slug: string
    description: string | null
    name: string
    selectedUsage: string | null
    selectedCategory: string | null
    selectedSource: string | null
  }
}
