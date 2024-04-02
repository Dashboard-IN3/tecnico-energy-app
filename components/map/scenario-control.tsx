import { useStore } from "../../app/lib/store"
import { baselineScenario } from "../../app/lib/utils"

export const ScenarioControl: React.FC = () => {
  const { setSelectedScenario } = useStore()
  const themes = useStore(state => state.selectedStudy.themes)
  const selectedTheme = useStore(state => state.selectedStudy?.selectedTheme)
  if (!selectedTheme || !Object.values(themes).length) {
    return <></>
  }
  const options = Object.values(selectedTheme?.scenarios)
    ?.filter((scenario: Studies.Scenario) => scenario.slug !== "baseline")
    .map((scenario: Studies.Scenario) => ({
      value: scenario.slug,
      label: scenario.name,
    }))

  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded shadow-md opacity-90">
      <div className="text-sm font-medium mb-2 ">Study Scenarios</div>
      <div>
        {options.map((option: any, key: number) => {
          const { selectedScenario } = themes[selectedTheme.slug]

          const newScenarioSelection =
            selectedTheme.scenarios[option.value] ?? baselineScenario

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
                        ? baselineScenario
                        : newScenarioSelection
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
