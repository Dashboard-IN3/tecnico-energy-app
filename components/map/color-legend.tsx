import { twMerge } from "tailwind-merge"

export const ColorLegend: React.FC = () => {
  const colorScheme = [
    `bg-[#fedeb4]`,
    `bg-[#fdb680]`,
    `bg-[#f4744e]`,
    `bg-[#cf281a]`,
    `bg-[#7f0000]`,
  ]

  return (
    <div className="absolute bottom-8 right-4 bg-white p-2 rounded shadow-md opacity-90 flex justify-center ">
      {colorScheme.map((style, key) => {
        return (
          <span key={key}>
            <div
              className={twMerge(
                "w-16 h-2 border-r-2 border-white last:border-r-12",
                style
              )}
            ></div>
            <div className="flex justify-center">254 M</div>
          </span>
        )
      })}
    </div>
  )
}
