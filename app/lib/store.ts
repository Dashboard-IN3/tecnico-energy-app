import { GeoJSONFeature } from "maplibre-gl"
import { create } from "zustand"

interface InitialState {
  selectedStudy: Studies.Study
  setAoi: (aoi: MapState.aoi) => void
  setTotalSelectedFeatures: (total: number) => void
  setIsDrawing: (isDrawing: boolean) => void
  setSelectedTheme: (theme: Studies.Theme) => void
  setSelectedScenario: (scenarioId: Studies.Scenario) => void
  // setSelectedStudy: (study: Studies.Study, themes: Studies.Theme[]) => void
}

export const useStore = create<InitialState>((set, get) => ({
  selectedStudy: {
    slug: "",
    name: "",
    description: "",
    image_src: "",
    totalSelectedFeatures: 0,
    isDrawing: false,
    aoi: {
      feature: undefined,
      bbox: [],
    },
    selectedThemeId: "",
    study_themes: {},
    selectedTheme: {
      name: "",
      slug: "",
      selectedScenario: { slug: "", name: "", description: "" },
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
        study_themes: {
          ...state.selectedStudy.study_themes,
          [state.selectedStudy.selectedTheme.slug]: {
            ...state.selectedStudy.selectedTheme,
            selectedScenario: scenario,
          },
        },
      },
    }))
  },
}))
