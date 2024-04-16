import { useState } from "react"
import Image from "next/image"

import { useStore } from "../../app/lib/store"
import trash from "../../public/icons/trash.svg"
import area from "../../public/icons/area.svg"

export const DrawControlPane: React.FC = () => {
  const { setIsDrawing, setAoi, selectedStudy } = useStore()
  const isDrawing = useStore(state => state.selectedStudy.isDrawing)
  const aoi = useStore(state => state.selectedStudy.aoi)
  const [isChecked, setIsChecked] = useState(false)
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked)
  }

  return (
    <div className="absolute bottom-4 left-4 bg-white p-4 rounded shadow-md opacity-90 flex justify-center gap-3">
      {selectedStudy.scale === "Building" && (
        <div className="justify-center items-center flex-col">
          <div className="text-slate-700 text-base font-normal font-['Inter'] leading-normal">
            Show 3D
          </div>

          <div
            className={`w-[50px] h-7 p-0.5 bg-slate-300 rounded-full justify-start items-center flex ${
              isChecked ? "bg-blue-500" : ""
            }`}
            onClick={handleCheckboxChange}
          >
            <div
              className={`w-6 h-6 bg-white rounded-full transform transition-transform ${
                isChecked ? "translate-x-[23px]" : "translate-x-0"
              }`}
            ></div>
          </div>
        </div>
      )}

      <div className="justify-center items-end flex gap-3">
        <button
          onClick={() => {
            setIsDrawing(!isDrawing)
            setAoi({ feature: undefined, bbox: [] })
          }}
          className={`hover:shadow-lg py-2 px-4 rounded-md border border-slate-800 ${
            isDrawing && "bg-slate-300"
          }`}
        >
          <Image src={area} alt="area logo" width={16} height={16} />
        </button>
        <button
          onClick={() => {
            setAoi({ feature: undefined, bbox: [] })
            setIsDrawing(false)
          }}
          className={`py-2 px-4 rounded-md border border-slate-800  ${
            aoi.feature ? "hover:shadow-lg" : "opacity-30 hover:cursor-default"
          }`}
        >
          <Image src={trash} alt="trash logo" width={16} height={16} />
        </button>
      </div>
    </div>
  )
}
