import { useStore } from "../../app/lib/store"

export const ScenarioControl: React.FC = () => {
  const { setSelectedScenario } = useStore()

  const selectedTheme = useStore(state => {
    const themeId = state.studies[state.selectedStudyId]?.selectedThemeId
    const allThemes = state.studies[state.selectedStudyId]?.themes
    const selectedTheme = allThemes?.find(theme => theme.slug === themeId)
    return selectedTheme
  }) as Studies.Theme

  const options = undefined // TODO: Currently we don't allow access to scenarios from a theme
  // const options = selectedTheme?.scenarios.map(
  //   (scenario: Studies.Scenario) => ({
  //     value: scenario.slug,
  //     label: scenario.name,
  //   })
  // )

  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded shadow-md opacity-90">
      <div className="text-sm font-medium mb-2 ">Study Scenarios</div>
      <div>
        {options?.map((option: any, key: number) => (
          <div key={key} className="mb-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value={option.value}
                checked={selectedTheme.selectedScenarioId === option.value}
                readOnly
                className="hidden"
                onClick={() => {
                  setSelectedScenario(
                    selectedTheme.slug,

                    option.value === selectedTheme.selectedScenarioId
                      ? null
                      : option.value
                  )
                }}
              />
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-4 h-4 border-2 border-sky-800 rounded-full mr-2 `}
                >
                  <div
                    className={`w-2 h-2  rounded-full ${
                      selectedTheme.selectedScenarioId === option.value
                        ? "bg-sky-800" // Background color when selected
                        : "bg-white" // Background color when not selected
                    }`}
                  ></div>
                </div>
                <span>{option.label}</span>
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
