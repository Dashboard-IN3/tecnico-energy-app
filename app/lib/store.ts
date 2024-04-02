import { GeoJSONFeature } from "maplibre-gl"
import { create } from "zustand"
import { baselineScenario } from "./utils"

interface InitialState {
  selectedStudy: Studies.Study
  setAoi: (aoi: MapState.aoi) => void
  setTotalSelectedFeatures: (total: number) => void
  setIsDrawing: (isDrawing: boolean) => void
  setSelectedTheme: (theme: Studies.Theme) => void
  setSelectedCategory: (scenario_slug: string, category: string) => void
  setSelectedSource: (scenario_slug: string, source: string) => void
  setSelectedUsage: (scenario_slug: string, usage: string) => void
  setSelectedScenario: (scenarioId: Studies.Scenario) => void
}

export const useStore = create<InitialState>((set, get) => ({
  selectedStudy: {
    slug: "",
    name: "",
    description: "",
    imageSrc: "",
    totalSelectedFeatures: 0,
    isDrawing: false,
    aoi: {
      feature: undefined,
      bbox: [],
    },
    metadata: {},
    selectedThemeId: "",
    themes: {},
    selectedTheme: {
      name: "",
      slug: "",
      selectedScenario: baselineScenario,
      scenarios: {},
    },
  },
  setAoi: (aoi: { feature: GeoJSONFeature; bbox: number[] }) => {
    set(state => ({ selectedStudy: { ...state.selectedStudy, aoi } }))
  },
  setTotalSelectedFeatures: (totalSelectedFeatures: number) => {
    set(state => ({
      selectedStudy: { ...state.selectedStudy, totalSelectedFeatures },
    }))
  },

  setIsDrawing: (isDrawing: boolean) => {
    set(state => ({
      selectedStudy: { ...state.selectedStudy, isDrawing },
    }))
  },

  setSelectedTheme: (theme: Studies.Theme) => {
    set(state => ({
      selectedStudy: {
        ...state.selectedStudy,
        selectedTheme: theme,
      },
    }))
  },

  setSelectedScenario: (scenario: Studies.Scenario) => {
    set(state => ({
      selectedStudy: {
        ...state.selectedStudy,
        selectedTheme: {
          ...state.selectedStudy.selectedTheme,
          selectedScenario: scenario,
        },
        themes: {
          ...state.selectedStudy.themes,
          [state.selectedStudy.selectedTheme.slug]: {
            ...state.selectedStudy.selectedTheme,
            selectedScenario: scenario,
          },
        },
      },
    }))
  },

  setSelectedCategory: (scenario_slug: string, category: string) => {
    set(state => ({
      selectedStudy: {
        ...state.selectedStudy,
        selectedTheme: {
          ...state.selectedStudy.selectedTheme,
          scenarios: {
            ...state.selectedStudy.selectedTheme.scenarios,
            [state.selectedStudy.selectedTheme.selectedScenario.slug]: {
              ...state.selectedStudy.selectedTheme.scenarios[scenario_slug],
              category,
            },
          },
        },
        themes: {
          ...state.selectedStudy.themes,
          [state.selectedStudy.selectedTheme.slug]: {
            ...state.selectedStudy.selectedTheme,
            scenarios: {
              ...state.selectedStudy.selectedTheme.scenarios,
              [state.selectedStudy.selectedTheme.selectedScenario.slug]: {
                ...state.selectedStudy.selectedTheme.scenarios[scenario_slug],
                category,
              },
            },
          },
        },
      },
    }))
  },
  setSelectedUsage: (scenario_slug: string, usage: string) => {
    set(state => ({
      selectedStudy: {
        ...state.selectedStudy,
        selectedTheme: {
          ...state.selectedStudy.selectedTheme,
          scenarios: {
            ...state.selectedStudy.selectedTheme.scenarios,
            [state.selectedStudy.selectedTheme.selectedScenario.slug]: {
              ...state.selectedStudy.selectedTheme.scenarios[scenario_slug],
              usage,
            },
          },
        },
        themes: {
          ...state.selectedStudy.themes,
          [state.selectedStudy.selectedTheme.slug]: {
            ...state.selectedStudy.selectedTheme,
            scenarios: {
              ...state.selectedStudy.selectedTheme.scenarios,
              [state.selectedStudy.selectedTheme.selectedScenario.slug]: {
                ...state.selectedStudy.selectedTheme.scenarios[scenario_slug],
                usage,
              },
            },
          },
        },
      },
    }))
  },
  setSelectedSource: (scenario_slug: string, source: string) => {
    set(state => ({
      selectedStudy: {
        ...state.selectedStudy,
        selectedTheme: {
          ...state.selectedStudy.selectedTheme,
          scenarios: {
            ...state.selectedStudy.selectedTheme.scenarios,
            [state.selectedStudy.selectedTheme.selectedScenario.slug]: {
              ...state.selectedStudy.selectedTheme.scenarios[scenario_slug],
              source,
            },
          },
        },
        themes: {
          ...state.selectedStudy.themes,
          [state.selectedStudy.selectedTheme.slug]: {
            ...state.selectedStudy.selectedTheme,
            scenarios: {
              ...state.selectedStudy.selectedTheme.scenarios,
              [state.selectedStudy.selectedTheme.selectedScenario.slug]: {
                ...state.selectedStudy.selectedTheme.scenarios[scenario_slug],
                source,
              },
            },
          },
        },
      },
    }))
  },
}))
