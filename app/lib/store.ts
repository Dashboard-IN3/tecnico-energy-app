import { GeoJSONFeature } from "maplibre-gl"
import { create } from "zustand"

interface InitialState {
  studies: Record<string, Studies.Study>
  selectedStudyId: string
  totalSelectedFeatures: number
  isDrawing: boolean
  setIsDrawing: (isDrawing: boolean) => void
  aoi: MapState.aoi
  setAoi: (aoi: MapState.aoi) => void
  setSelectedStudy: (study: Studies.Study, themes: Studies.Theme[]) => void
  setSelectedTheme: (studyId: string, themeId: string) => void
  setSelectedScenario: (themeId: string, scenarioId: string) => void
  setTotalSelectedFeatures: (total: number) => void
}

export const useStore = create<InitialState>(set => ({
  totalSelectedFeatures: 0,
  setTotalSelectedFeatures: (totalSelectedFeatures: number) => {
    set({ totalSelectedFeatures })
  },
  isDrawing: false,
  setIsDrawing: (isDrawing: boolean) => {
    set({ isDrawing })
  },
  aoi: {
    feature: undefined,
    bbox: [],
  },
  setAoi: (aoi: { feature: GeoJSONFeature; bbox: number[] }) => {
    set({ aoi })
  },
  studies: {},
  selectedStudyId: "",
  setSelectedStudy: (study: Studies.Study, themes: Studies.Theme[]) => {
    set(state => ({
      studies: {
        ...state.studies,
        [study.slug]: {
          ...study,
          selectedThemeId: state.studies[study.slug]?.selectedThemeId
            ? state.studies[study.slug]?.selectedThemeId
            : themes[0]?.slug,
        },
      },
      selectedStudyId: study.slug,
    }))
  },
  setSelectedTheme: (studyId: string, themeId: string) => {
    set(state => ({
      studies: {
        ...state.studies,
        [studyId]: {
          ...state.studies[studyId],
          selectedThemeId: themeId,
        },
      },
    }))
  },
  setSelectedScenario: (themeId: string, scenarioId: string) => {
    set(state => ({
      studies: {
        ...state.studies,
        [state.selectedStudyId]: {
          ...state.studies[state.selectedStudyId],
          themes: state.studies[state.selectedStudyId]?.themes?.map(theme =>
            theme.slug === themeId
              ? { ...theme, selectedScenarioId: scenarioId }
              : theme
          ),
        },
      },
    }))
  },
}))
