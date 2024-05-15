"use client"

import React, { useRef, useState, ReactNode, useEffect } from "react"
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
import { relative } from "path"

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
    hoveredFeature,
    setHoveredFeature,
    setTotalSelectedFeatures,
    setSummaryAvg,
    setSummaryDescription,
    setSummaryTotal,
    setSummaryUnit,
  } = useStore()
  const { selectedTheme } = selectedStudy
  const selectedScenario = selectedTheme.selectedScenario
  const category = selectedScenario?.selectedCategory?.value
  const usage = selectedScenario?.selectedUsage?.value
  const source = selectedScenario?.selectedSource?.value

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
    const featureIDs = search.search[0]?.feature_ids ?? []
    const summaryTotal = search.search[0]?.data_total ?? 0
    const summaryUnit = search.search[0]?.data_unit ?? ""
    const summaryAvg = search.search[0]?.data_avg ?? 0

    const summaryDescription = search.search[0]?.data_description ?? ""
    setSummaryDescription(summaryDescription)

    const mapFeatures = search.search[0].feature_objects
    const summaryMax = search.search[0].data_max

    updateIntersectingFeatures(mapFeatures, summaryMax)
    setTotalSelectedFeatures(mapFeatures.length)
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

  const updateIntersectingFeatures = (featureIdsToUpdate, summaryMax) => {
    // remove Ids that are no longer in new array of ids
    const toRemove = difference(selectedFeatureIds, featureIdsToUpdate)

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
    const toAdd = difference(featureIdsToUpdate, selectedFeatureIds)

    toAdd.forEach(featureData => {
      // console.log(featureData.shading, summaryTotal)
      // Update the paint properties of specific features by ID
      map!.setFeatureState(
        {
          source: "building-footprints",
          sourceLayer: "default",
          id: featureData.id,
        },
        {
          selected: true,
          relative_shading_percentage: (featureData.shading / summaryMax) * 100,
        }
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

  // hover feature handler
  useEffect(() => {
    if (!map) return

    let hoveredPolygonId: string | null = null

    const hoverLayerName = "buildings-layer"

    const handleMouseMove = (e: any) => {
      if (e.features && e.features.length > 0) {
        map.getCanvas().style.cursor = "pointer"
        const newHoveredPolygonId = e.features[0].id ?? null

        if (newHoveredPolygonId !== hoveredPolygonId) {
          if (hoveredPolygonId !== null) {
            map.setFeatureState(
              {
                source: "building-footprints",
                sourceLayer: "default",
                id: hoveredPolygonId,
              },
              { hover: false }
            )
          }

          hoveredPolygonId = newHoveredPolygonId ?? null

          setHoveredFeature({
            id: hoveredPolygonId,
            location: e.lngLat,
            value: e.features[0].properties.shading,
            unit: e.features[0].properties.unit,
          })

          map.setFeatureState(
            {
              source: "building-footprints",
              sourceLayer: "default",
              id: hoveredPolygonId as any,
            },
            { hover: true }
          )
        }
      }
    }

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = ""
      if (hoveredPolygonId !== null) {
        map.setFeatureState(
          {
            source: "building-footprints",
            sourceLayer: "default",
            id: hoveredPolygonId,
          },
          { hover: false }
        )
        hoveredPolygonId = null
        setHoveredFeature({
          id: null,
          location: null,
          value: null,
          unit: null,
        })
      }
    }

    map.on("mousemove", hoverLayerName, handleMouseMove)
    map.on("mouseleave", hoverLayerName, handleMouseLeave)

    return () => {
      map.off("mousemove", hoverLayerName, handleMouseMove)
      map.off("mouseleave", hoverLayerName, handleMouseLeave)
    }
  }, [map, setHoveredFeature])

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
