import dynamic from "next/dynamic"
import { useStore } from "../app/lib/store"
const Select = dynamic(() => import("react-select"), { ssr: false })

export type Option = { value: string; label: string }

export const ThemeSelector: React.FC = () => {
  const selectedStudy = useStore(state => state.selectedStudy)
  const { selectedTheme, themes } = selectedStudy
  const { setSelectedTheme } = useStore()

  const selectedOption = {
    value: selectedTheme?.slug,
    label: selectedTheme?.name,
  } as Option

  const options = Object.values(themes)?.map(theme => ({
    value: theme.slug,
    label: theme.name,
  })) as Option[]

  return (
    <div className="">
      <div className="text-black text-md font-semibold font-['Inter'] leading-tight pb-2">
        Theme:
      </div>
      <Select
        id="react-selector"
        value={selectedOption}
        onChange={(option: any) => {
          setSelectedTheme(option.value)
        }}
        options={options}
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            borderColor: state.isFocused ? "black" : "grey",
            fontFamily: "Inter",
          }),
          container: (baseStyles, state) => ({
            ...baseStyles,
            fontFamily: "Inter",
          }),
        }}
      />
    </div>
  )
}
