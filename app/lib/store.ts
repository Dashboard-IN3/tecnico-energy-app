import { GeoJSONFeature } from "maplibre-gl"
import { create } from "zustand"

interface InitialState {
  selectedStudy: Studies.Study
  setAoi: (aoi: MapState.aoi) => void
  setTotalSelectedFeatures: (total: number) => void
  setIsDrawing: (isDrawing: boolean) => void
  setSelectedTheme: (theme: Studies.Theme) => void
  setSelectedCategory: (category: string) => void
  setSelectedSource: (source: string) => void
  setSelectedUsage: (usage: string) => void
  setSelectedScenario: (scenarioId: Studies.Scenario | null) => void
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
      selectedScenario: {
        slug: "",
        description: "",
        name: "",
        selectedCategory: null,
        selectedSource: null,
        selectedUsage: null,
      },
      scenarios: [],
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

  setSelectedUsage: (source: string) => {
    set(state => ({
      selectedStudy: {
        ...state.selectedStudy,
        themes: {
          ...state.selectedStudy.themes,
          [state.selectedStudy.selectedTheme.slug]: {
            ...state.selectedStudy.selectedTheme,
            scenarios: {
              ...state.selectedStudy.selectedTheme.selectedScenario,
            },
          },
        },
      },
    }))
  },

  setSelectedSource: (usage: string) => {
    set(state => ({
      selectedStudy: {
        ...state.selectedStudy,
        themes: {
          ...state.selectedStudy.themes,
          [state.selectedStudy.selectedTheme.slug]: {
            ...state.selectedStudy.selectedTheme,
            scenarios: {
              ...state.selectedStudy.selectedTheme.selectedScenario,
            },
          },
        },
      },
    }))
  },

  setSelectedCategory: (category: string) => {
    set(state => ({
      selectedStudy: {
        ...state.selectedStudy,
        themes: {
          ...state.selectedStudy.themes,
          [state.selectedStudy.selectedTheme.slug]: {
            ...state.selectedStudy.selectedTheme,
            selectedScenario: category,
          },
        },
      },
    }))
  },
}))
