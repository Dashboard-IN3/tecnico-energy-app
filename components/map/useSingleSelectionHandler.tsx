import { useCallback, useEffect } from "react"

import { MapFeature } from "./map"
import { useStore } from "../../app/lib/store"

// mark as selected if clicked and not already selected
// or if already selected and not clicked
const isMarkedForSelection = (feature, clickedFeature) =>
  (!clickedFeature.state.selected && clickedFeature.id === feature.id) ||
  (clickedFeature.id !== feature.id && feature.isSelected)

export const useSingleSelectionHandler = ({
  map,
  selectedFeaturesById,
  setSelectedFeaturesById,
}) => {
  const selectedStudy = useStore(state => state.selectedStudy)
  const { mapInteraction } = selectedStudy
  const singleSelectionHandler = useCallback(
    e => {
      if (!map) return
      if (e.features && e.features.length > 0 && selectedFeaturesById) {
        const clickedFeature = e.features[0]
        const clickedFeatureId = clickedFeature.id
        const selectedFeature = selectedFeaturesById[clickedFeatureId]
        const currentMax = Object.values(
          selectedFeaturesById as { [id: string]: MapFeature }
        ).reduce((acc, feature) => {
          return Math.max(
            acc,
            isMarkedForSelection(feature, clickedFeature) ? feature.shading : 0
          )
        }, 0)
        // Update map features
        Object.values(
          selectedFeaturesById as { [id: string]: MapFeature }
        ).forEach(feature => {
          const isFeatureMarkedForSelection = isMarkedForSelection(
            feature,
            clickedFeature
          )
          // Update the paint properties of specific features by ID
          map.setFeatureState(
            {
              source: "building-footprints",
              sourceLayer: "default",
              id: feature.id,
            },
            {
              selected: isFeatureMarkedForSelection ? true : undefined,
              relative_shading_percentage: isFeatureMarkedForSelection
                ? (feature.shading / currentMax) * 100
                : undefined,
            }
          )
        })

        // update state features
        setSelectedFeaturesById(state => {
          if (!state) {
            return null
          } else {
            return {
              ...state,
              [clickedFeature.id]: {
                ...state[clickedFeature.id],
                isSelected: selectedFeature.isSelected ? false : true,
              },
            }
          }
        })
      }
    },
    [selectedFeaturesById, map, mapInteraction]
  )
  useEffect(() => {
    if (!map || mapInteraction !== "selection") return

    map.on("click", "buildings-layer", singleSelectionHandler)

    return () => {
      map.off("click", "buildings-layer", singleSelectionHandler)
    }
  }, [map, singleSelectionHandler, mapInteraction])
}
