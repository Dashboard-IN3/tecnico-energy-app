"use client"

import Image from "next/image"
import { ThemeSelector } from "./theme-selector"
import { InPageLink } from "./in-page-link"
import { useStore } from "../app/lib/store"

interface Props {
  src: string
  study_id: string
}

export const SidePane: React.FC<Props> = ({ src, study_id }) => {
  const title = useStore(state => state.studies[state.selectedStudyId]?.title)
  const { totalSelectedFeatures } = useStore()

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
          {totalSelectedFeatures} Features
        </div>
      </div>
      <ThemeSelector />
      <div className="self-stretch grow shrink basis-0 flex-col justify-start items-start gap-6 flex">
        <div className="self-stretch h-[0px] origin-top-left rotate-180 border border-black"></div>
        <div className="self-stretch h-[68px] flex-col justify-start items-start gap-3 flex">
          Number of Features in Spatial DB Query
        </div>
        <div className="self-stretch h-[0px] origin-top-left rotate-180 border border-black"></div>
      </div>
    </div>
  )
}
