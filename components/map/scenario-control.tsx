import { useStore } from "../../app/lib/store"

export const ScenarioControl: React.FC = () => {
  const { setSelectedScenario } = useStore()
  const themes = useStore(state => state.selectedStudy.themes)
  const selectedTheme = useStore(state => state.selectedStudy?.selectedTheme)
  if (!selectedTheme || !Object.values(themes).length) {
    return <></>
  }

  const options = [] // TODO: Currently we don't allow access to scenarios from a theme
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
        {options?.map((option: any, key: number) => {
          const { selectedScenario } = themes[selectedTheme.slug]

          return (
            <div key={key} className="mb-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value={option.value}
                  checked={selectedScenario?.slug === option.value}
                  readOnly
                  className="hidden"
                  onClick={() => {
                    setSelectedScenario(
                      option.value === selectedScenario?.slug
                        ? null
                        : themes[selectedTheme.slug].scenarios[option.value]
                    )
                  }}
                />
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-4 h-4 border-2 border-sky-800 rounded-full mr-2 `}
                  >
                    <div
                      className={`w-2 h-2  rounded-full ${
                        selectedScenario?.slug === option.value
                          ? "bg-sky-800" // Background color when selected
                          : "bg-white" // Background color when not selected
                      }`}
                    ></div>
                  </div>
                  <span>{option.label}</span>
                </div>
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )
}
