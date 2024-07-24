"use client"

import React, { useRef, useState, ReactNode, useEffect } from "react"
import Map, { LngLatLike, MapRef } from "react-map-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import maplibregl from "maplibre-gl"
import DrawBboxControl from "./draw-bbox-control"
import { bbox } from "@turf/turf"
import { ScenarioControl } from "./scenario-control"
import { useStore } from "../../app/lib/store"
import { DrawControlPane } from "./draw-control-pane"
import { ColorLegend } from "./color-legend"
import { useHoverFeature } from "./useHoverFeature"
import { useFeatureState } from "./useSelectedFeatureState"
import { useSingleSelectionHandler } from "./useSingleSelectionHandler"

type MapViewProps = {
  children?: ReactNode
  bbox: number[]
  id: string
  studySlug: string
}

export type MapFeature = { id: string; shading: number; isSelected: boolean }

const MapView = ({ bbox: studyBounds, children, studySlug }: MapViewProps) => {
  const [map, setMap] = useState<MapRef>()
  const mapContainer = useRef(null)
  const setMapRef = (m: MapRef) => setMap(m)
  const { setAoi, setMapInteraction } = useStore()
  const selectedStudy = useStore(state => state.selectedStudy)
  const { aoi, mapInteraction } = selectedStudy
  const [selectedFeaturesById, setSelectedFeaturesById] = useState<{
    [id: string]: MapFeature
  } | null>(null)
  const { setHoveredFeature } = useStore()

  useFeatureState({
    map,
    selectedFeaturesById,
    setSelectedFeaturesById,
    studySlug,
  })

  // map event handlers
  const handleDrawComplete = (feature: GeoJSON.Feature) => {
    setMapInteraction(null)
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

  // hover feature handler
  useHoverFeature({
    map,
    mapInteraction,
    setHoveredFeature,
  })

  useSingleSelectionHandler({
    map,
    selectedFeaturesById,
    setSelectedFeaturesById,
  })

  return (
    <div ref={mapContainer} className="h-full w-full">
      <Map
        ref={setMapRef}
        style={{ width: "100%", height: "100%" }}
        mapLib={maplibregl}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        onLoad={() => {
          map?.fitBounds(studyBounds as LngLatLike, {
            padding: 20,
          })
        }}
      >
        <ScenarioControl />
        <DrawControlPane />
        <ColorLegend />
        <DrawBboxControl
          {...{
            map: map!,
            isEnabled: mapInteraction === "drawing",
            handleDrawComplete,
            aoi,
            drawSelectionChange,
            drawUpdate,
          }}
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
