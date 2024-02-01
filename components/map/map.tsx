"use client"

import React, { useRef, useState, ReactNode, useEffect } from "react"
import Map, { MapRef } from "react-map-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import maplibregl, { LngLatLike } from "maplibre-gl"
import DrawBboxControl from "./draw-bbox-control"
import { GeoJSONFeature } from "./types"
import { bbox } from "@turf/turf"
import { getAoiFeatures } from "../aoi/aoi-search"
import { ScenarioControl } from "./scenario-control"
import { useStore } from "../../app/lib/store"
import { round, difference } from "lodash-es"
import { DrawControlPane } from "./draw-control-pane"

type MapViewProps = {
  children?: ReactNode
  center: number[]
  zoom: number
  id: string
}

const MapView = ({ id, center, zoom, children }: MapViewProps) => {
  const [map, setMap] = useState<MapRef>()
  const [roundedZoom, setRoundedZoom] = useState(0)
  const mapContainer = useRef(null)
  const setMapRef = (m: MapRef) => setMap(m)
  const { setAoi, aoi, isDrawing, setIsDrawing } = useStore()
  const [selectedFeatureIds, setSelectedFeatureIds] = useState([])

  useEffect(() => {
    if (selectedFeatureIds && !aoi.feature) {
      updateIntersectingFeatures([])
    }
    if (!map || !aoi.feature || !aoi.bbox[0]) return

    const southWest = [aoi.bbox[0], aoi.bbox[1]] as LngLatLike
    const northEast = [aoi.bbox[2], aoi.bbox[3]] as LngLatLike

    // query rendered features within bounding box
    const northEastPointPixel = map.project(northEast)
    const southWestPointPixel = map.project(southWest)
    const features = map.queryRenderedFeatures(
      [southWestPointPixel, northEastPointPixel],
      { layers: ["buildings-layer"] }
    )

    // calculate intersections between features and aoi
    const intersectingFeatures = getAoiFeatures(
      features,
      aoi.feature.geometry.coordinates
    )

    updateIntersectingFeatures(intersectingFeatures)
  }, [aoi.feature, aoi.bbox, map, roundedZoom])

  const updateIntersectingFeatures = featureIdsToUpdate => {
    // remove Ids that are no longer in new array of ids
    const toRemove = difference(selectedFeatureIds, featureIdsToUpdate)

    toRemove.forEach(featureID => {
      // Update the paint properties of specific features by ID
      map.setFeatureState(
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
      map.setFeatureState(
        {
          source: "building-footprints",
          sourceLayer: "default",
          id: featureID,
        },
        { selected: true }
      )
    })

    setSelectedFeatureIds(featureIdsToUpdate)
  }

  // map event handlers
  const handleDrawComplete = (feature: GeoJSONFeature) => {
    setIsDrawing(false)
    setAoi({
      bbox: bbox(feature.geometry),
      feature,
    })
  }

  const drawUpdate = (feature: GeoJSONFeature) => {
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

  // footprint loading event listener
  useEffect(() => {
    if (!map) return

    const dataHandler = () => {
      console.log("All data loaded")
    }

    map.once("data", dataHandler)

    return () => {
      map.off("data", dataHandler)
    }
  }, [map])

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
