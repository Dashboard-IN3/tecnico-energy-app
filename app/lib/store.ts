import { GeoJSONFeature } from "maplibre-gl"
import { create } from "zustand"
import { baselineScenario } from "./utils"

type mapFeature = {
  id: string | null
  location: { lat: number; lng: number } | null
}
interface InitialState {
  hoveredFeature: mapFeature
  setHoveredFeature: (mapFeature) => void
  selectedStudy: Studies.Study
  setAoi: (aoi: MapState.aoi) => void
  setTotalSelectedFeatures: (featureTotal: number) => void
  setSummaryTotal: (summaryTotal: number) => void
  setSummaryUnit: (summaryUnit: string) => void
  setSummaryAvg: (summaryAvg: number) => void
  setIsDrawing: (isDrawing: boolean) => void
  setSelectedTheme: (theme: Studies.Theme) => void
  setSelectedCategory: (
    scenario_slug: string,
    category: { value: string; label: string }
  ) => void
  setSelectedSource: (
    scenario_slug: string,
    source: { value: string; label: string }
  ) => void
  setSelectedUsage: (
    scenario_slug: string,
    usage: { value: string; label: string }
  ) => void
  setSelectedScenario: (scenarioId: Studies.Scenario) => void
  setShow3d: () => void
  show3d: boolean
}

export const useStore = create<InitialState>((set, get) => ({
  hoveredFeature: { id: null, location: null },
  selectedStudy: {
    slug: "",
    scale: null,
    name: "",
    description: "",
    imageSrc: "",
    summary: {
      totalSelectedFeatures: 0,
      summaryTotal: 0,
      summaryUnit: "null",
      summaryAvg: 0,
    },
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
      selectedStudy: {
        ...state.selectedStudy,
        summary: {
          ...state.selectedStudy.summary,
          totalSelectedFeatures,
        },
      },
    }))
  },

  setSummaryTotal: (summaryTotal: number) => {
    set(state => ({
      selectedStudy: {
        ...state.selectedStudy,
        summary: {
          ...state.selectedStudy.summary,
          summaryTotal,
        },
      },
    }))
  },

  setSummaryUnit: (summaryUnit: string) => {
    set(state => ({
      selectedStudy: {
        ...state.selectedStudy,
        summary: {
          ...state.selectedStudy.summary,
          summaryUnit,
        },
      },
    }))
  },

  setSummaryAvg: (summaryAvg: number) => {
    set(state => ({
      selectedStudy: {
        ...state.selectedStudy,
        summary: {
          ...state.selectedStudy.summary,
          summaryAvg,
        },
      },
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

  setSelectedCategory: (
    scenario_slug: string,
    category: { value: string; label: string }
  ) => {
    set(state => ({
      selectedStudy: {
        ...state.selectedStudy,
        selectedTheme: {
          ...state.selectedStudy.selectedTheme,
          selectedScenario: {
            ...state.selectedStudy.selectedTheme.selectedScenario,
            selectedCategory: category,
          },
          scenarios: {
            ...state.selectedStudy.selectedTheme.scenarios,
            [scenario_slug]: {
              ...state.selectedStudy.selectedTheme.scenarios[scenario_slug],
              selectedCategory: category,
            },
          },
        },
        themes: {
          ...state.selectedStudy.themes,
          [state.selectedStudy.selectedTheme.slug]: {
            ...state.selectedStudy.selectedTheme,
            scenarios: {
              ...state.selectedStudy.selectedTheme.scenarios,
              [scenario_slug]: {
                ...state.selectedStudy.selectedTheme.scenarios[scenario_slug],
                selectedCategory: category,
              },
            },
          },
        },
      },
    }))
  },
  setSelectedUsage: (
    scenario_slug: string,
    usage: { value: string; label: string }
  ) => {
    set(state => ({
      selectedStudy: {
        ...state.selectedStudy,
        selectedTheme: {
          ...state.selectedStudy.selectedTheme,
          selectedScenario: {
            ...state.selectedStudy.selectedTheme.selectedScenario,
            selectedUsage: usage,
          },
          scenarios: {
            ...state.selectedStudy.selectedTheme.scenarios,
            [scenario_slug]: {
              ...state.selectedStudy.selectedTheme.scenarios[scenario_slug],
              selectedUsage: usage,
            },
          },
        },
        themes: {
          ...state.selectedStudy.themes,
          [state.selectedStudy.selectedTheme.slug]: {
            ...state.selectedStudy.selectedTheme,
            scenarios: {
              ...state.selectedStudy.selectedTheme.scenarios,
              [scenario_slug]: {
                ...state.selectedStudy.selectedTheme.scenarios[scenario_slug],
                selectedUsage: usage,
              },
            },
          },
        },
      },
    }))
  },

  setSelectedSource: (
    scenario_slug: string,
    source: { value: string; label: string }
  ) => {
    set(state => ({
      selectedStudy: {
        ...state.selectedStudy,
        selectedTheme: {
          ...state.selectedStudy.selectedTheme,
          selectedScenario: {
            ...state.selectedStudy.selectedTheme.selectedScenario,
            selectedSource: source,
          },
          scenarios: {
            ...state.selectedStudy.selectedTheme.scenarios,
            [scenario_slug]: {
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
              [scenario_slug]: {
                ...state.selectedStudy.selectedTheme.scenarios[scenario_slug],
                source,
              },
            },
          },
        },
      },
    }))
  },
  show3d: false,
  setShow3d: () => {
    set(state => ({ ...state, show3d: !state.show3d }))
  },
  setHoveredFeature: (feature: mapFeature) => {
    set(state => ({ ...state, hoveredFeature: feature }))
  },
}))
