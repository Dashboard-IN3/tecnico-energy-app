"use client"

import { useEffect } from "react"
import Image from "next/image"
import { InPageLink } from "./in-page-link"
import { useStore } from "../app/lib/store"
import { DropdownMenu, DropdownOption } from "./dropdown-menu"
import { getMetricsOptions } from "../app/lib/utils"
import { round } from "lodash-es"
import { largeNumberDisplay } from "../lib/utils"

interface Props {
  imgSrc?: string | null
  studyId: string
}

const SummaryValue = ({ value, unit, label }) => {
  return (
    <div className="flex justify-between mb-2 last:mb-0">
      <span className="font-bold">{label} </span>
      <span>
        <span> {largeNumberDisplay(round(value, 2))} </span>
        <span className="text-xs font-extralight text-slate-800">{unit}</span>
      </span>
    </div>
  )
}

export const SidePane: React.FC<Props> = ({ imgSrc, studyId }) => {
  const {
    selectedStudy,
    setSelectedTheme,
    setSelectedCategory,
    setSelectedSource,
    setSelectedUsage,
  } = useStore()
  const { selectedTheme, themes, metadata } = selectedStudy

  const selectedScenario = selectedTheme?.selectedScenario
  const { selectedCategory, selectedSource, selectedUsage } = selectedScenario

  const themeDropdownOptions = Object.values(themes)?.map(theme => ({
    value: theme.slug,
    label: theme.name,
  })) as DropdownOption[]

  const scenarioKey = selectedScenario?.slug

  // Render unique options based on existing selection
  const scenarioMetaData =
    metadata[selectedTheme.slug] && metadata[selectedTheme.slug][scenarioKey]
      ? metadata[selectedTheme.slug][scenarioKey].combinations
      : []

  const metricsOptions = getMetricsOptions({
    metadata: scenarioMetaData,
    selectedCategory,
    selectedUsage,
    selectedSource,
  })

  // Ensure selected categories/usages/sources are valid for given scenario
  useEffect(() => {
    const { categories, usages, sources } = metricsOptions
    if (
      categories.length &&
      !categories.map(({ value }) => value).includes(selectedCategory?.value)
    ) {
      setSelectedCategory(scenarioKey, categories[0])
    }
    if (
      usages.length &&
      !usages.map(({ value }) => value).includes(selectedUsage?.value)
    ) {
      setSelectedUsage(scenarioKey, usages[0])
    }
    if (
      sources.length &&
      !sources.map(({ value }) => value).includes(selectedSource?.value)
    ) {
      setSelectedSource(scenarioKey, sources[0])
    }
  }, [selectedCategory?.value, selectedUsage?.value, selectedSource?.value])

  return (
    <div
      className="w-full h-full p-3 md:p-7 bg-slate-100 flex-col justify-start gap-4 md:inline-flex overflow-scroll"
      style={{
        zIndex: 1,
        scrollbarWidth: "none",
        boxShadow: "6px 0 10px -2px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="w-full text-black text-xl font-extrabold leading-loose">
        {selectedStudy.name}
      </div>
      {imgSrc && (
        <div className="relative w-full min-h-[175px] max-w-[250px] md:max-w-lg">
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
        {/* <InPageLink href={`${studyId}/attributes`} label="Data Attribues" /> */}
        <div className="grow shrink basis-0 text-right text-black text-sm font-normal leading-tight">
          {selectedStudy.summary.totalSelectedFeatures} Features
        </div>
      </div>

      <div className="self-stretch grow-0 shrink basis-0 flex-col justify-start items-start gap-6 flex border-solid border-[1px] border-slate-400 bg-white p-4 rounded-md">
        <div className="w-full">
          <SummaryValue
            value={selectedStudy.summary.summaryTotal}
            unit={selectedStudy.summary.summaryUnit}
            label="Total"
          />
          <SummaryValue
            value={selectedStudy.summary.summaryAvg}
            unit={selectedStudy.summary.summaryUnit}
            label="Average"
          />
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
      <DropdownMenu
        title="Category"
        options={metricsOptions.categories}
        selected={selectedCategory || { value: "-", label: "-" }}
        setSelected={option => setSelectedCategory(scenarioKey, option)}
      />
      <DropdownMenu
        title="Usage"
        options={metricsOptions.usages}
        selected={selectedUsage || { value: "-", label: "-" }}
        setSelected={option => setSelectedUsage(scenarioKey, option)}
      />
      <DropdownMenu
        title="Source"
        options={metricsOptions.sources}
        selected={selectedSource || { value: "-", label: "-" }}
        setSelected={option => setSelectedSource(scenarioKey, option)}
      />
    </div>
  )
}
