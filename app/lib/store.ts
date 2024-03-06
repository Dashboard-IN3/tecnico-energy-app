import { GeoJSONFeature } from "maplibre-gl"
import { create } from "zustand"

interface InitialState {
  selectedStudy: Studies.Study
  setAoi: (aoi: MapState.aoi) => void
  setTotalSelectedFeatures: (total: number) => void
  setIsDrawing: (isDrawing: boolean) => void
  setSelectedTheme: (slug: string) => void
  setSelectedScenario: (slug: string) => void
}

export const initialScenarioState = { slug: "", name: "", description: "" }

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
    selectedThemeId: "",
    themes: {},
    selectedTheme: {
      name: "",
      slug: "",
      selectedScenario: initialScenarioState,
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

  setSelectedTheme: (slug: string) => {
    set(state => ({
      selectedStudy: {
        ...state.selectedStudy,
        selectedTheme: state.selectedStudy.themes[slug],
      },
    }))
  },

  setSelectedScenario: (slug: string) => {
    set(state => {
      const newScenario = state.selectedStudy.selectedTheme.scenarios[slug]
      const oldScenario = state.selectedStudy.selectedTheme.selectedScenario
      return {
        selectedStudy: {
          ...state.selectedStudy,
          themes: {
            ...state.selectedStudy.themes,
            [state.selectedStudy.selectedTheme.slug]: {
              ...state.selectedStudy.selectedTheme,
              selectedScenario:
                slug === oldScenario?.slug ? initialScenarioState : newScenario,
            },
          },
          selectedTheme: {
            ...state.selectedStudy.selectedTheme,
            selectedScenario:
              slug === oldScenario?.slug ? initialScenarioState : newScenario,
          },
        },
      }
    })
  },
}))
