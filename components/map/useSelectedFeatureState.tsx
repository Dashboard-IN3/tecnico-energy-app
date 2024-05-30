import { useEffect } from "react"
import { difference } from "lodash-es"

import { useStore } from "../../app/lib/store"
import { MapFeature } from "./map"

const updateDrawFeatures = ({
  dbSearchFeatures,
  selectedFeaturesById,
  search,
  map,
}) => {
  const selectedFeatures = selectedFeaturesById
    ? Object.values(selectedFeaturesById)
    : []

  const summaryMax = search.search[0].data_max
  // remove Ids that are no longer in new array of ids
  const toRemove = difference(selectedFeatures, dbSearchFeatures)

  toRemove.forEach(featureData => {
    // Update the paint properties of specific features by ID
    map!.setFeatureState(
      {
        source: "building-footprints",
        sourceLayer: "default",
        id: featureData.id,
      },
      { selected: undefined, relative_shading_percentage: undefined }
    )
  })

  // add Ids that are in new selection but not in previous yet
  const toAdd = difference(dbSearchFeatures, selectedFeatures)

  toAdd.forEach(feature => {
    // Update the paint properties of specific features by ID
    map!.setFeatureState(
      {
        source: "building-footprints",
        sourceLayer: "default",
        id: feature.id,
      },
      {
        selected: true,
        relative_shading_percentage: (feature.shading / summaryMax) * 100,
      }
    )
  })
}

const clearMapFeatureSelection = ({
  selectedFeaturesById,
  setMapStagedForClearing,
  summary,
  map,
}) => {
  Object.values(selectedFeaturesById).forEach((feature: MapFeature) => {
    // Update the paint properties of specific features by ID
    map!.setFeatureState(
      {
        source: "building-footprints",
        sourceLayer: "default",
        id: feature.id,
      },
      {
        selected: false,
        relative_shading_percentage:
          (feature.shading / summary.summaryMax) * 100,
      }
    )
  })
  setMapStagedForClearing(false)
}

const getDbIntersectingFeatures = async ({
  coordinates,
  studySlug,
  scenarioSlug,
  metricsField,
}) => {
  const linestring = coordinates
    ? encodeURI(coordinates.map(pair => pair.join(" ")).join(","))
    : null
  const searchResponse = await fetch(
    `${global.window?.location.origin}/api/search/${studySlug}/${scenarioSlug}/${metricsField}?coordinates=${linestring}`
  )
  return await searchResponse.json()
}

export const useFeatureState = ({
  map,
  selectedFeaturesById,
  setSelectedFeaturesById,
  studySlug,
}) => {
  const {
    setMapStagedForClearing,
    setSummaryDescription,
    selectedStudy,
    setSummaryUnit,
    setTotalSelectedFeatures,
    setSummaryAvg,
    setSummaryMax,
    setSummaryTotal,
  } = useStore()
  const {
    aoi,
    mapInteraction,
    isMapStagedForClearing,
    summary,
    selectedTheme,
  } = selectedStudy
  const selectedScenario = selectedTheme.selectedScenario
  const category = selectedScenario?.selectedCategory?.value
  const usage = selectedScenario?.selectedUsage?.value
  const source = selectedScenario?.selectedSource?.value
  const metricsField = `${category}.${usage}.${source}`
  const updateFeatureState = async ({
    coordinates,
    studySlug,
    scenarioSlug,
    metricsField,
  }) => {
    // only run this for draw interactions
    const search = await getDbIntersectingFeatures({
      coordinates,
      studySlug,
      scenarioSlug,
      metricsField,
    })

    const summaryUnit = search.search[0]?.data_unit ?? ""
    const summaryDescription = search.search[0]?.data_description ?? ""
    const dbSearchFeatures = search.search[0].feature_objects

    setSummaryDescription(summaryDescription)
    setSummaryUnit(summaryUnit)

    const augmentedDbFeatures = dbSearchFeatures.reduce((acc, feature) => {
      acc[feature.id] = {
        ...feature,
        isSelected: true,
      }
      return acc
    }, {})

    // update map features
    if (!selectedFeaturesById) {
      setSelectedFeaturesById(augmentedDbFeatures)
      updateDrawFeatures({
        dbSearchFeatures,
        selectedFeaturesById,
        map,
        search,
      })
    } else {
      if (mapInteraction === "selection") {
        const augmentedDbFeatures = dbSearchFeatures.reduce((acc, feature) => {
          acc[feature.id] = {
            ...feature,
            isSelected: false,
          }
          return acc
        }, {})

        setSelectedFeaturesById(augmentedDbFeatures)
        if (isMapStagedForClearing) {
          clearMapFeatureSelection({
            selectedFeaturesById: augmentedDbFeatures,
            map,
            summary,
            setMapStagedForClearing,
          })
        }
      } else {
        setSelectedFeaturesById(state => {
          if (!state) return null
          Object.values(state).forEach((feature: MapFeature) => {
            state[feature.id].isSelected = false
          })
          return { ...state, ...augmentedDbFeatures }
        })
        updateDrawFeatures({
          dbSearchFeatures,
          selectedFeaturesById,
          map,
          search,
        })
      }
    }
  }

  useEffect(() => {
    if (![map, category, usage, source].every(Boolean)) return
    updateFeatureState({
      coordinates: aoi.feature ? aoi.feature.geometry.coordinates[0] : null,
      studySlug,
      metricsField,
      scenarioSlug: selectedScenario?.slug,
    })
  }, [
    aoi.feature,
    map,
    metricsField,
    selectedScenario?.slug,
    mapInteraction,
    isMapStagedForClearing,
  ])

  //update summary values when selected features change
  useEffect(() => {
    if (!selectedFeaturesById) return
    const selectedFeatureSummary = Object.values(
      selectedFeaturesById as { [id: string]: MapFeature }
    ).reduce(
      (acc, feature) => ({
        ...acc,
        total: acc.total + (feature.isSelected ? 1 : 0),
        summaryTotal:
          acc.summaryTotal + (feature.isSelected ? feature.shading : 0),
        max: Math.max(acc.max, feature.isSelected ? feature.shading : 0),
      }),
      { summaryTotal: 0, total: 0, max: 0 }
    )
    // update state summary values
    setTotalSelectedFeatures(selectedFeatureSummary.total)
    setSummaryTotal(selectedFeatureSummary.summaryTotal)
    setSummaryMax(selectedFeatureSummary.max)
    setSummaryAvg(
      selectedFeatureSummary.total
        ? selectedFeatureSummary.summaryTotal / selectedFeatureSummary.total
        : 0
    )
  }, [selectedFeaturesById])
}
