declare namespace Studies {
  export type Study = {
    study_themes: { [themeId: string]: Theme }
    slug: string
    name: string
    description: string
    image_src: string
    selectedTheme?: Theme
    selectedThemeId: string
    totalSelectedFeatures: number
    isDrawing: boolean
    aoi: MapState.aoi
  }

  export type Theme = {
    name: string
    slug: string
    scenarios: Scenario[]
    selectedScenario: Scenario
  }

  export type Scenario = {
    slug: string
    description: string
    name: string
  }
}
