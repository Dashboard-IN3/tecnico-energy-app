import { GeoJSONFeature } from "maplibre-gl"
import { create } from "zustand"

interface InitialState {
  studies: Record<string, Studies.Study>
  selectedStudyId: string
  isDrawing: boolean
  setIsDrawing: (isDrawing: boolean) => void
  aoi: MapState.aoi
  setAoi: (aoi: MapState.aoi) => void
  setSelectedStudy: (study: Studies.Study, themes: Studies.Theme[]) => void
  setSelectedTheme: (studyId: string, themeId: string) => void
  setSelectedScenario: (themeId: string, scenarioId: string) => void
}

export const useStore = create<InitialState>(set => ({
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
        [study.id]: {
          ...study,
          selectedThemeId: state.studies[study.id]?.selectedThemeId
            ? state.studies[study.id]?.selectedThemeId
            : themes[0].id,
        },
      },
      selectedStudyId: study.id,
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
            theme.id === themeId
              ? { ...theme, selectedScenarioId: scenarioId }
              : theme
          ),
        },
      },
    }))
  },
}))
