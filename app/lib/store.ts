import { create } from "zustand"

interface InitialState {
  studies: Record<string, Studies.Study>
  selectedStudyId: string
  setSelectedStudy: (study: Studies.Study, themes: Studies.Theme[]) => void
  setSelectedTheme: (studyId: string, themeId: string) => void
  setSelectedScenario: (themeId: string, scenarioId: string) => void
}

export const useStore = create<InitialState>(set => ({
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
