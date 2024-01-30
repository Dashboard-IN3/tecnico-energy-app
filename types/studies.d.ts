declare namespace Studies {
  export type Study = {
    themes: Studies.Theme[]
    id: string
    title: string
    description: string
    href: string
    image_src: string
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
    title: string
  }
}
