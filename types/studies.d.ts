declare namespace Studies {
  export type Study = {
    themes: Studies.Theme[]
    id: string
    name: string
    description: string
    imageSrc: string
    selectedTheme?: Theme
    selectedThemeId: string
  }

  export type Theme = {
    name: string
    id: string
    scenarios: Scenario[]
    selectedScenarioId?: string
  }

  export type Scenario = {
    id: string
    description: string
    name: string
  }
}
