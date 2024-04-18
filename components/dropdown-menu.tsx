import dynamic from "next/dynamic"
import { useStore } from "../app/lib/store"
const Select = dynamic(() => import("react-select"), { ssr: false })

export type DropdownOption = { value: string; label: string }

interface Props {
  title: string
  options: DropdownOption[]
  selected: DropdownOption
  setSelected: (arg: DropdownOption) => void
}

export const DropdownMenu: React.FC<Props> = ({
  title,
  options,
  selected,
  setSelected,
}) => {
  return (
    <div className="">
      <div className="text-black text-md font-semibold leading-tight pb-2">
        {title}:
      </div>
      <Select
        id="react-selector"
        value={selected}
        onChange={(option: any) => {
          setSelected(option)
        }}
        options={options}
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            borderColor: state.isFocused ? "black" : "grey",
          }),
          container: (baseStyles, state) => ({
            ...baseStyles,
          }),
        }}
      />
    </div>
  )
}
