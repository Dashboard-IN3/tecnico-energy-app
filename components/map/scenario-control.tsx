import { useState } from "react"
import { useStore } from "../../app/lib/store"

export const ScenarioControl: React.FC = () => {
  const { setSelectedScenario } = useStore()
  const [showDescription, setShowDescription] = useState(false)
  const themes = useStore(state => state.selectedStudy.themes)
  const selectedTheme = useStore(state => state.selectedStudy?.selectedTheme)
  if (!selectedTheme || !Object.values(themes).length) {
    return <></>
  }

  type ScenarioOption = { value: string; label: string; description: string }

  const options = Object.values(selectedTheme?.scenarios)
    ?.filter((scenario: Studies.Scenario) => scenario.slug !== "baseline")
    .map((scenario: Studies.Scenario) => ({
      value: scenario.slug,
      label: scenario.name,
      description: scenario.description,
    }))

  return (
    <div
      className={`absolute top-4 right-4 w-[30%] h-[50%] bg-white p-6 rounded shadow-md opacity-90 border-solid border  ${
        showDescription ? "max-h-[50%] max-w-[35%] overflow-y-scroll" : ""
      }`}
      style={{
        zIndex: 1,
        scrollbarWidth: "none",
        boxShadow: "6px 0 10px -2px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="text-lg font-medium mb-4">
        {selectedTheme.name} Scenarios
      </div>
      <div>
        {options.map((option: ScenarioOption, key: number) => {
          const { selectedScenario } = themes[selectedTheme.slug]
          const newScenarioSelection = selectedTheme.scenarios[option.value]
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
                        ? selectedTheme.scenarios["baseline"]
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
                  <span className="font-semibold">{option.label}</span>
                </div>
              </label>
              {showDescription && (
                <div className="pl-6">{option.description} </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="text-sm font-medium absolute top-[31px] right-7 align-center justify-center">
        <div className="items-center flex">
          <div
            className={`w-[30px] h-4 p-0.5 text-sky-800 rounded-full justify-start items-center flex cursor-pointer ${
              showDescription
                ? "bg-[#075985]"
                : "bg-[#DAEBFF] border-solid border-[1px] border-sky-800"
            }`}
            onClick={() => setShowDescription(!showDescription)}
          >
            <div
              className={`w-3 h-3 bg-white rounded-full transform transition-transform ${
                showDescription ? "translate-x-[15px]" : "translate-x-0"
              }`}
            ></div>
          </div>
          <div className="text-xs font-light leading-normal ml-2">
            Show Descriptions
          </div>
        </div>
      </div>
    </div>
  )
}
