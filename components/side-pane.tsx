"use client"

import Image from "next/image"
import { ThemeSelector } from "./theme-selector"
import { InPageLink } from "./in-page-link"
import { useStore } from "../app/lib/store"
import { DropdownMenu, DropdownOption } from "./dropdown-menu"

interface Props {
  imgSrc?: string
  studyId: string
}

export const SidePane: React.FC<Props> = ({ imgSrc, studyId }) => {
  const { selectedStudy, setSelectedTheme } = useStore()
  const { selectedTheme, themes } = selectedStudy
  console.log({ themes })
  const themeDropdownOptions = Object.values(themes)?.map(theme => ({
    value: theme.slug,
    label: theme.name,
  })) as DropdownOption[]
  console.log({ themeDropdownOptions })
  return (
    <div className="w-full h-full p-3 md:p-7 bg-slate-100 shadow-lg relative flex-col justify-start gap-6 md:inline-flex overflow-hidden">
      <div className="w-full text-black text-xl font-extrabold font-['Inter'] leading-loose">
        {selectedStudy.name}
      </div>
      {imgSrc && (
        <div className="relative w-full min-h-[150px]">
          <Image
            className="w-full h-[200px] object-cover rounded-lg"
            src={imgSrc}
            fill={true}
            alt="Placeholder"
            sizes="(max-width: 150px) 100vw, (max-width: 150px) 50vw, 150px"
            priority={true}
          />
        </div>
      )}

      <div className="self-stretch justify-end items-start gap-6 inline-flex">
        <InPageLink href={`${studyId}/details`} label="Study Details" />
        <InPageLink href={`${studyId}/attributes`} label="Data Attribues" />
        <div className="grow shrink basis-0 text-right text-black text-sm font-normal font-['Inter'] leading-tight">
          {selectedStudy.totalSelectedFeatures} Features
        </div>
      </div>
      <DropdownMenu
        title="Theme"
        options={themeDropdownOptions}
        selected={{
          value: selectedTheme?.slug,
          label: selectedTheme?.name,
        }}
        setSelected={option => setSelectedTheme(themes[option.value])}
      />
      {/* <DropdownMenu
        title="Category"
        options={[]}
        selected={{ value: "energy", label: "Energy" }}
        setSelected={() => {}}
      />
      <DropdownMenu
        title="Usage"
        options={[]}
        selected={{ value: "cooking", label: "Cooking" }}
        setSelected={() => {}}
      />
      <DropdownMenu
        title="Source"
        options={[]}
        selected={{ value: "all", label: "All" }}
        setSelected={() => {}}
      /> */}
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
