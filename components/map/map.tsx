"use client"

import React, { useRef, useState, ReactNode, useEffect } from "react"
import Map, { MapRef } from "react-map-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import maplibregl, { LngLatLike } from "maplibre-gl"
import BackgroundTiles from "./background-tiles"
import DrawBboxControl from "./draw-bbox-control"
import { GeoJSONFeature } from "./types"
import { bbox } from "@turf/turf"
import { useAoiSearch } from "../aoi/aoi-search"
import { ScenarioControl } from "./scenario-control"
import { useStore } from "../app/lib/store"

type MapViewProps = {
  children?: ReactNode
  center: number[]
  zoom: number
  id: string
  setIsDrawing: (arg: any) => void
  isDrawing: boolean
}

const MapView = ({
  id,
  center,
  zoom,
  children,
  setIsDrawing,
  isDrawing,
}: MapViewProps) => {
  const [map, setMap] = useState<MapRef>()
  const mapContainer = useRef(null)
  const setMapRef = (m: MapRef) => setMap(m)

  const [aoi, setAoi] = useState<{
    feature: GeoJSONFeature
    bbox: number[]
  }>({
    feature: {} as GeoJSONFeature,
    bbox: [],
  })

  const handleDrawComplete = (feature: GeoJSONFeature) => {
    setIsDrawing(false)

    setAoi(() => ({
      bbox: bbox(feature.geometry),
      feature,
    }))
  }

  // useEffect(() => {
  //   if (!map || !aoi.feature) return

  //   const southWest = [aoi.bbox[0], aoi.bbox[1]] as LngLatLike
  //   const northEast = [aoi.bbox[2], aoi.bbox[3]] as LngLatLike

  //   const northEastPointPixel = map.project(northEast)
  //   const southWestPointPixel = map.project(southWest)
  //   const features = map.queryRenderedFeatures(
  //     [southWestPointPixel, northEastPointPixel],
  //     { layers: ["buildings-layer"] }
  //   )

  //   const intersections = useAoiSearch(
  //     features,
  //     aoi.feature.geometry.coordinates
  //   )
  //   console.log({ intersections })
  //   getIntersectingFeatures(intersections)
  // }, [aoi.feature])

  // const getIntersectingFeatures = featureIDsToUpdate => {
  //   featureIDsToUpdate.forEach(featureID => {
  //     // Update the paint properties of specific features by ID
  //     map.setFeatureState(
  //       {
  //         source: "buildings",
  //         sourceLayer: "lx_buildings_augmented",
  //         id: featureID,
  //       },
  //       { selected: true }
  //     )
  //   })
  // }

  const drawUpdate = () => {
    console.log("draw update fired")
  }
  const drawSelectionChange = () => {
    console.log("draw selection fired")
  }

  // zoom event listener
  useEffect(() => {
    if (!map) return

    const zoomHandler = () => {
      console.log(map.getZoom())
    }
    map.on("zoomend", zoomHandler)
    return () => {
      map.off("zoomend", zoomHandler)
    }
  }, [map])

  // useEffect(() => {
  //   if (fitTo && map.current) {
  //     map.current.fitBounds(fitTo, {
  //       padding: { top: 100, bottom: 100, left: 100, right: 100 },
  //     })
  //   }
  // }, [fitTo])

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
        {/* <BackgroundTiles /> */}
        <ScenarioControl />
        <DrawBboxControl
          map={map}
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