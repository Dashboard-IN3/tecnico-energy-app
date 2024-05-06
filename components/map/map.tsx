"use client"

import React, {
  useRef,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react"
import Map, { MapRef } from "react-map-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import maplibregl from "maplibre-gl"
import DrawBboxControl from "./draw-bbox-control"
import { bbox } from "@turf/turf"
import { ScenarioControl } from "./scenario-control"
import { useStore } from "../../app/lib/store"
import { round, difference } from "lodash-es"
import { DrawControlPane } from "./draw-control-pane"
import { ColorLegend } from "./color-legend"

type MapViewProps = {
  children?: ReactNode
  center: number[]
  zoom: number
  id: string
  studySlug: string
}

const MapView = ({ id, center, zoom, children, studySlug }: MapViewProps) => {
  const [map, setMap] = useState<MapRef>()
  const [roundedZoom, setRoundedZoom] = useState(0)
  const mapContainer = useRef(null)
  const setMapRef = (m: MapRef) => setMap(m)
  const { setAoi, setIsDrawing } = useStore()
  const selectedStudy = useStore(state => state.selectedStudy)
  const { aoi, isDrawing } = selectedStudy
  const [selectedFeatureIds, setSelectedFeatureIds] = useState([])
  const {
    hoveredFeatureId,
    setHoveredFeatureId,
    setTotalSelectedFeatures,
    setSummaryAvg,
    setSummaryTotal,
    setSummaryUnit,
  } = useStore()
  const { selectedTheme } = selectedStudy
  const selectedScenario = selectedTheme.selectedScenario
  const category = selectedScenario?.selectedCategory?.value
  const usage = selectedScenario?.selectedUsage?.value
  const source = selectedScenario?.selectedSource?.value
  console.log({ hoveredFeatureId })
  const metricsField = `${category}.${usage}.${source}`

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
    const search = await searchResponse.json()
    const featureIDs = search.search[0].feature_ids
    const summaryTotal = search.search[0].data_total
    const summaryUnit = search.search[0].data_unit
    const summaryAvg = search.search[0].data_avg

    updateIntersectingFeatures(featureIDs)
    setTotalSelectedFeatures(featureIDs.length)
    setSummaryAvg(summaryAvg)
    setSummaryTotal(summaryTotal)
    setSummaryUnit(summaryUnit)
  }

  useEffect(() => {
    if (![map, category, usage, source].every(Boolean)) return
    getDbIntersectingFeatures({
      coordinates: aoi.feature ? aoi.feature.geometry.coordinates[0] : null,
      studySlug,
      metricsField,
      scenarioSlug: selectedScenario?.slug,
    })
  }, [aoi.feature, aoi.bbox, map, metricsField, selectedScenario?.slug])

  const updateIntersectingFeatures = featureIdsToUpdate => {
    // remove Ids that are no longer in new array of ids
    const toRemove = difference(selectedFeatureIds, featureIdsToUpdate)

    toRemove.forEach(featureID => {
      // Update the paint properties of specific features by ID
      map!.setFeatureState(
        {
          source: "building-footprints",
          sourceLayer: "default",
          id: featureID,
        },
        { selected: undefined }
      )
    })

    // add Ids that are in new selection but not in previous yet
    const toAdd = difference(featureIdsToUpdate, selectedFeatureIds)

    toAdd.forEach(featureID => {
      // Update the paint properties of specific features by ID
      map!.setFeatureState(
        {
          source: "building-footprints",
          sourceLayer: "default",
          id: featureID,
        },
        { selected: true }
      )
    })

    setSelectedFeatureIds(featureIdsToUpdate)
    setTotalSelectedFeatures(featureIdsToUpdate.length)
  }

  // map event handlers
  const handleDrawComplete = (feature: GeoJSON.Feature) => {
    setIsDrawing(false)
    setAoi({
      bbox: bbox(feature.geometry),
      feature,
    })
  }

  const drawUpdate = (feature: GeoJSON.Feature) => {
    setAoi({
      bbox: bbox(feature.geometry),
      feature,
    })
  }
  const drawSelectionChange = () => {
    console.log("draw selection fired")
  }

  // zoom event listener
  useEffect(() => {
    if (!map) return

    const zoomHandler = () => {
      setRoundedZoom(round(map.getZoom()))
    }
    map.on("zoomend", zoomHandler)
    return () => {
      map.off("zoomend", zoomHandler)
    }
  }, [map])

  const hoverLayerName = "buildings-layer"
  const hoverHandler = useCallback(
    (e, isLeaving, map) => {
      const featureId = e.features?.[0] ? e.features[0].id : null

      if (isLeaving) {
        map.setFeatureState(
          {
            source: "building-footprints",
            sourceLayer: "default",
            id: hoveredFeatureId,
          },
          { hover: false }
        )
        map.getCanvas().style.cursor = ""
        setHoveredFeatureId(null)
      } else if (featureId !== hoveredFeatureId) {
        map.setFeatureState(
          {
            source: "building-footprints",
            sourceLayer: "default",
            id: hoveredFeatureId,
          },
          { hover: false }
        )

        map.setFeatureState(
          {
            source: "building-footprints",
            sourceLayer: "default",
            id: featureId,
          },
          { hover: true }
        )

        map.getCanvas().style.cursor = "pointer"
        setHoveredFeatureId(featureId)
      }
    },

    [setHoveredFeatureId, hoveredFeatureId]
  )
  // hover feature handler
  useEffect(() => {
    if (!map) return

    map.on("mousemove", hoverLayerName, e => hoverHandler(e, false, map))
    map.on("mouseleave", hoverLayerName, e => hoverHandler(e, true, map))
    return () => {
      map.off("mousemove", hoverLayerName, e => hoverHandler(e, false, map))
      map.off("mouseleave", hoverLayerName, e => hoverHandler(e, true, map))
    }
  }, [map, hoverHandler])

  return (
    <div ref={mapContainer} className="h-full w-full">
      <Map
        ref={setMapRef}
        style={{ width: "100%", height: "100%" }}
        initialViewState={{
          latitude: center[1],
          longitude: center[0],
          zoom,
        }}
        mapLib={maplibregl}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      >
        <ScenarioControl />
        <DrawControlPane />
        <ColorLegend />
        <DrawBboxControl
          map={map!}
          isEnabled={isDrawing}
          handleDrawComplete={handleDrawComplete}
          aoi={aoi}
          drawSelectionChange={drawSelectionChange}
          drawUpdate={drawUpdate}
        />
        {map &&
          children &&
          React.Children.map(children, child =>
            React.cloneElement(child as JSX.Element, {})
          )}
      </Map>
    </div>
  )
}

export default MapView
