"use client"

import Image from "next/image"
import { useState } from "react"
import trash from "../public/icons/trash.svg"
import area from "../public/icons/area.svg"
import { ThemeSelector } from "./theme-selector"
import { Theme } from "./explore"
import { useStore } from "../app/lib/store"
import { InPageLink } from "./in-page-link"

interface Props {
  src: string
  setIsDrawing: (arg: any) => void
  isDrawing: boolean
  study_id: string
}

export const SidePane: React.FC<Props> = ({
  src,
  setIsDrawing,
  isDrawing,
  study_id,
}) => {
  const [isChecked, setIsChecked] = useState(false)
  const title = useStore(state => state.studies[state.selectedStudyId].title)

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked)
  }

  return (
    <div className="w-full h-full p-3 md:p-7 bg-slate-100 shadow-lg relative flex-col justify-start gap-6 md:inline-flex overflow-hidden">
      <div className="w-full text-black text-xl font-extrabold font-['Inter'] leading-loose">
        {title}
      </div>
      <div className="relative w-full min-h-[150px]">
        <Image
          className="w-full h-[200px] object-cover rounded-lg"
          src={src}
          fill={true}
          alt="Placeholder"
          sizes="(max-width: 150px) 100vw, (max-width: 150px) 50vw, 150px"
          priority={true}
        />
      </div>

      <div className="self-stretch justify-end items-start gap-6 inline-flex">
        <InPageLink href={`${study_id}/details`} label="Study Details" />
        <InPageLink href={`${study_id}/attributes`} label="Data Attribues" />
        <div className="grow shrink basis-0 text-right text-black text-sm font-normal font-['Inter'] leading-tight">
          X buildings
        </div>
      </div>
      <ThemeSelector />
      <div className="self-stretch grow shrink basis-0 flex-col justify-start items-start gap-6 flex">
        <div className="self-stretch h-[0px] origin-top-left rotate-180 border border-black"></div>

        <div className="self-stretch h-[68px] flex-col justify-start items-start gap-3 flex">
          <div className="text-sky-800 text-xl font-medium font-['Inter'] leading-7">
            Number of selected Buildings
          </div>
          <div className="self-stretch justify-start items-end gap-3 inline-flex">
            <div>
              {/* <span className="text-black text-xl font-normal font-['Inter'] leading-7">
                €
              </span> */}
              <span className="text-black text-xl font-semibold font-['Inter'] leading-7">
                0
              </span>
            </div>
          </div>
        </div>
        <div className="self-stretch h-[0px] origin-top-left rotate-180 border border-black"></div>
      </div>
      <div className="justify-start items-center gap-6 inline-flex">
        <div className="justify-start items-start gap-3 flex">
          <div className="justify-start items-center gap-[13px] flex">
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
          <div className="text-black text-base font-normal font-['Inter'] leading-normal">
            Show 3D Buildings
          </div>
        </div>
        <button
          onClick={() => {
            setIsDrawing(true)
          }}
          className={`hover:shadow-lg py-2 px-4 rounded-md border border-slate-800 ${
            isDrawing && "bg-slate-300"
          }`}
        >
          <Image src={area} alt="area logo" width={16} height={16} />
        </button>
        <button
          onClick={() => {
            setIsDrawing(true)
          }}
          className="hover:shadow-lg py-2 px-4 rounded-md border border-slate-800 "
        >
          <Image src={trash} alt="trash logo" width={16} height={16} />
        </button>
      </div>
    </div>
  )
}
