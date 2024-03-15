declare namespace Studies {
  export type Study = {
    themes: Theme[]
    slug: string
    name: string
    description: string
    imageSrc?: string
    selectedTheme?: Theme
    selectedThemeId: string
  }

  export type Theme = {
    name: string
    slug: string
    selectedScenarioId?: string
  }

  export type Scenario = {
    slug: string
    description: string
    name: string
  }
}
