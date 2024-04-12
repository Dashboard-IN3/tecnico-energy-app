declare namespace Studies {
  export type Study = {
    themes: { [themeId: string]: Theme }
    slug: string
    name: string
    description: string
    image_src?: string | null
    selectedTheme: Theme
    selectedThemeId: string
    totalSelectedFeatures: number
    isDrawing: boolean
    aoi: MapState.aoi
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
  }
}
