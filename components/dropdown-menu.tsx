import dynamic from "next/dynamic"
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
      <div className="text-black text-sm leading-tight pb-1.5">{title}:</div>
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
            borderColor: state.isFocused ? "gray" : "white",
            fontSize: "14px",
          }),
          container: (baseStyles, state) => ({
            ...baseStyles,
            fontSize: "14px",
          }),
        }}
      />
    </div>
  )
}
