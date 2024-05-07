import { twMerge } from "tailwind-merge"
import { useStore } from "../../app/lib/store"
import { largeNumberDisplay } from "../../lib/utils"

export const ColorLegend: React.FC = () => {
  const { selectedStudy } = useStore()
  const selectedCategory =
    selectedStudy?.selectedTheme?.selectedScenario?.selectedCategory?.label
  const summaryUnit = selectedStudy.summary.summaryUnit

  const total = selectedStudy.summary.summaryTotal

  const colorScheme = [
    `bg-[#fedeb4]`,
    `bg-[#fdb680]`,
    `bg-[#f4744e]`,
    `bg-[#cf281a]`,
    `bg-[#7f0000]`,
  ]

  return (
    <div className="absolute bottom-8 right-4 bg-white p-2 rounded shadow-md opacity-90">
      <div className="pb-2">{`${selectedCategory} in ${summaryUnit}`}</div>
      <div className="flex justify-center">
        {colorScheme.map((style, idx) => {
          return (
            <span key={idx}>
              <div
                className={twMerge(
                  "w-16 h-2 border-r-2 border-white last:border-r-12",
                  style
                )}
              ></div>
              <div className="flex justify-center">
                {largeNumberDisplay(total / (colorScheme.length - idx), 0)}
              </div>
            </span>
          )
        })}
      </div>
    </div>
  )
}
